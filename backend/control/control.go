package control

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/rules"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"

	"github.com/Zeus-Labs/ZeusCloud/models"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"gorm.io/gorm"
)

var ExecuteRulesMutex sync.Mutex

type StatusResponse struct {
	// status can have the following values:
	// 1) RUNNING - the cartography job is running or not yet executed but present in the queue
	// 2) READY - the cartography job is not present in the queue and is ready to be pushed to the queue
	// 3) RULES_RUNNING - the rules are being executed
	// 4) CARTOGRAPHY_PASSED - the cartography job is successfully completed without any exception
	// 5) FAILED - the cartography job is completed with an exception
	// 6) PASSED - the rule execution is successfully completed
	Status      string  `json:"status"`
	RunningTime float64 `json:"running_time,omitempty"`
}

type CartographyJobRequest struct {
	AccountName        string `json:"account_name"`
	Profile            string `json:"profile,omitempty"`
	AwsAccessKeyId     string `json:"aws_access_key_id,omitempty"`
	AwsSecretAccessKey string `json:"aws_secret_access_key,omitempty"`
	DefaultRegion      string `json:"default_region,omitempty"`
	VulnerabilityScan  string `json:"vulnerability_scan,omitempty"`
}

// ExecuteRules attempts to
//  1. Execute the rules and insert the rule results in postgress DB
//  2. After rules are executed, the scan_status and last_scan_completed
//     columns of RULES_RUNNING accounts in AccountDetails table in postgress DB are updated.
func ExecuteRules(postgresDb *gorm.DB, driver neo4j.Driver, rulesToExecute []types.Rule) {

	for {
		time.Sleep(time.Second * 5)

		ExecuteRulesMutex.Lock()
		if areAccountsReadyForExecutingRules, err := checkAccountsReadyForExecutingRules(postgresDb); err != nil {
			log.Printf("Error in checking RULES_RUNNING status of accounts")
			ExecuteRulesMutex.Unlock()
			continue
		} else if !areAccountsReadyForExecutingRules {
			ExecuteRulesMutex.Unlock()
			continue
		}

		for _, r := range rulesToExecute {
			log.Printf("Rule ID and description: %v %v", r.UID(), r.Description())

			// Skip if rule is inactive
			active, err := rules.IsRuleActive(postgresDb, r)
			if err != nil {
				log.Printf("Error querying for rule activity... %v", err)
				continue
			}
			if !active {
				log.Printf("Rule is inactive. Skipping...")
				continue
			}

			// Execute rule
			results, err := rules.ExecuteRule(driver, r)
			if err != nil {
				log.Printf("Error executing rule: %v", err)
				continue
			}

			if tx := postgresDb.Model(&models.RuleData{}).Where("uid = ?", r.UID()).Updates(map[string]interface{}{"last_run": time.Now()}); tx.Error != nil {
				log.Printf("Error in updating the last_run field for rule with UID: %v", r.UID())
				continue
			}

			var rd models.RuleData
			if tx := postgresDb.Where("uid = ?", r.UID()).Find(&rd); tx.Error != nil {
				log.Printf("Error in fetching the rule with UID: %v", r.UID())
				continue
			}

			// Upsert rule results
			err = rules.UpsertRuleResults(postgresDb, rd, results)
			if err != nil {
				log.Printf("Unexpected error upserting rule_results %v", err)
				continue
			}

			// Delete stale rule results
			err = rules.DeleteStaleRuleResults(postgresDb, rd)
			if err != nil {
				log.Printf("Unexpected error deleting unseen results %v", err)
				continue
			}
		}

		if tx := postgresDb.Model(&models.AccountDetails{}).Where("scan_status = ?", "RULES_RUNNING").Updates(map[string]interface{}{"scan_status": "PASSED", "last_scan_completed": time.Now()}); tx.Error != nil {
			log.Printf("Error in updating the scan status from RULES_RUNNING to PASSED and last_scan_completed: %v", tx.Error)
		}

		ExecuteRulesMutex.Unlock()
	}

}

// Attempts to start the cartography job by hitting the /start_job cartography api
func StartCartographyJob(account models.AccountDetails) error {
	// TODO: Change this when nuclei is merged
	var cjr CartographyJobRequest
	if account.ConnectionMethod == "profile" {
		cjr = CartographyJobRequest{
			AccountName:       account.AccountName,
			Profile:           account.Profile,
			VulnerabilityScan: account.VulnerabilityScan,
		}
	} else if account.ConnectionMethod == "access_key" {
		cjr = CartographyJobRequest{
			AccountName:        account.AccountName,
			AwsAccessKeyId:     account.AwsAccessKeyId,
			AwsSecretAccessKey: account.AwsSecretAccessKey,
			DefaultRegion:      account.DefaultRegion,
			VulnerabilityScan:  account.VulnerabilityScan,
		}
	} else {
		// Invalid Connection Method
		return fmt.Errorf("Invalid Connection Method: %v, provided for account: %v ", account.ConnectionMethod, account.AccountName)
	}

	// Attempt to start cartography job
	cjrJSON, err := json.Marshal(cjr)
	if err != nil {
		return fmt.Errorf("Error marshalling cartography job request: %v", err)
	}
	resp, err := http.Post(os.Getenv("CARTOGRAPHY_URI")+"/start_job", "application/json", bytes.NewBuffer(cjrJSON))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	var sr StatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return err
	}
	if sr.Status == "FAILED" {
		return fmt.Errorf("scan status: failed")
	}
	return nil
}

// Attempts to run a loop which fetches the account which is ready to be scanned
// and starts cartography job and execute rules for that account
func CartographyExecutionLoop(postgresDb *gorm.DB, driver neo4j.Driver) {
	for {
		time.Sleep(time.Second * 5)

		ExecuteRulesMutex.Lock()

		if err := ResetCartographyStatus(postgresDb); err != nil {
			log.Printf("Error in resetting cartography status values, Error: %v", err)
			ExecuteRulesMutex.Unlock()
			continue
		}

		a, err := getAccountReadyToBeScanned(postgresDb)
		if err != nil {
			log.Printf("Error in fetching the details of account with status as READY: %v", err)
			ExecuteRulesMutex.Unlock()
			continue
		} else if a == (nil) {
			// No accounts found which are ready to be scanned
			ExecuteRulesMutex.Unlock()
			continue
		}
		account := *a
		if err := StartCartographyJob(account); err != nil {
			log.Printf("Error in starting cartography job for Account Name : %v \nError: %v", account.AccountName, err)
			ExecuteRulesMutex.Unlock()
			continue
		}

		monitorCartographyJobStatusLoop(postgresDb, account.AccountName)

		// Change CARTOGRAPHY_PASSED status to RULES_RUNNNING
		if tx := postgresDb.Model(&models.AccountDetails{}).Where("scan_status = ?", "CARTOGRAPHY_PASSED").Updates(map[string]interface{}{"scan_status": "RULES_RUNNING"}); tx.Error != nil {
			log.Printf("Error in updating the scan status of CARTOGRAPHY_PASSED accounts to RULES_RUNNNING: %v", tx.Error)
			ExecuteRulesMutex.Unlock()
			continue
		}

		ExecuteRulesMutex.Unlock()
	}
}

func monitorCartographyJobStatusLoop(postgresDb *gorm.DB, accountName string) {
	scanStatus := "READY"
	for {
		time.Sleep(time.Second * 10)
		sr, err := GetScanStatus()
		if err != nil {
			log.Printf("Error fetching cartography job status: %v", err)
			continue
		}
		if sr.Status != scanStatus {
			tx := postgresDb.Model(&models.AccountDetails{}).Where("account_name = ?", accountName).Updates(map[string]interface{}{"scan_status": sr.Status})
			if tx.Error != nil {
				log.Printf("Error updating the scan status of account: %v", accountName)
				continue
			}
			scanStatus = sr.Status
		}
		if sr.Status == "CARTOGRAPHY_PASSED" || sr.Status == "FAILED" {
			break
		}
		tx := postgresDb.Model(&models.AccountDetails{}).Where("account_name = ?", accountName).Updates(map[string]interface{}{"running_time": sr.RunningTime})
		if tx.Error != nil {
			log.Printf("Error in updating the running_time of account %v", accountName)
			continue
		}
	}
	log.Printf("Cartography job scanning completed for Account name: %v", accountName)

	if scanStatus == "FAILED" {
		if tx := postgresDb.Model(&models.AccountDetails{}).Where("account_name = ?", accountName).Update("last_scan_completed", time.Now()); tx.Error != nil {
			log.Printf("Error in updating the last_scan_completed of account %v", accountName)
		}
	}
}

func getAccountReadyToBeScanned(postgresDb *gorm.DB) (*models.AccountDetails, error) {
	var accountDetailsLst []models.AccountDetails
	tx := postgresDb.Where("scan_status = ?", "READY").Limit(1).Find(&accountDetailsLst)

	if tx.Error != nil {
		return nil, tx.Error
	}
	if len(accountDetailsLst) == 0 {
		// No accounts found which are ready to be scanned
		return nil, nil
	}
	return &accountDetailsLst[0], nil
}

func checkAccountsReadyForExecutingRules(postgresDb *gorm.DB) (bool, error) {
	var rulesRunningAccounts []models.AccountDetails
	tx := postgresDb.Where("scan_status = ?", "RULES_RUNNING").Find(&rulesRunningAccounts)
	if tx.Error != nil {
		return false, tx.Error
	}
	return len(rulesRunningAccounts) != 0, nil
}

func ResetCartographyStatus(postgresDb *gorm.DB) error {
	statusValues := []string{"RULES_RUNNING", "RUNNING", "FAILED", "CARTOGRAPHY_PASSED"}
	tx := postgresDb.Model(&models.AccountDetails{}).Where("scan_status IN (?)", statusValues).Updates(map[string]interface{}{"scan_status": "READY"})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func QueueAccountsToBeScanned(postgresDb *gorm.DB, accountQueuedToBeScanned string) error {
	tx := postgresDb.Model(&models.AccountDetails{}).Where("account_name = ?", accountQueuedToBeScanned).Updates(map[string]interface{}{"scan_status": "READY", "running_time": 0})
	if tx.Error != nil {
		return tx.Error
	}
	return nil
}

func GetScanStatus() (StatusResponse, error) {
	resp, err := http.Get(os.Getenv("CARTOGRAPHY_URI") + "/get_status")
	if err != nil {
		return StatusResponse{}, err
	}
	defer resp.Body.Close()
	var sr StatusResponse
	if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
		return StatusResponse{}, err
	}
	return sr, nil
}

type AwsProfilesResponse struct {
	AwsProfiles []string `json:"aws_profiles"`
}

func GetAwsProfiles() (AwsProfilesResponse, error) {
	resp, err := http.Get(os.Getenv("CARTOGRAPHY_URI") + "/get_aws_profiles")
	if err != nil {
		return AwsProfilesResponse{}, err
	}
	defer resp.Body.Close()
	var apr AwsProfilesResponse
	if err := json.NewDecoder(resp.Body).Decode(&apr); err != nil {
		return AwsProfilesResponse{}, err
	}
	return apr, nil
}

type VulnRuleInfo struct {
	CveIdentifier string  `json:"id,omitempty"`
	Name          string  `json:"name,omitempty"`
	Description   string  `json:"description,omitempty"`
	CvssScore     float64 `json:"cvss_score,omitempty"`
	YamlTemplate  string  `json:"yaml_template,omitempty"`
}

func GetVulnRuleInfo() ([]VulnRuleInfo, error) {
	resp, err := http.Get(os.Getenv("CARTOGRAPHY_URI") + "/get_templates_info")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	var vri []VulnRuleInfo
	if err := json.NewDecoder(resp.Body).Decode(&vri); err != nil {
		return nil, err
	}
	return vri, nil
}
