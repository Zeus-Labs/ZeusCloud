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

	"github.com/Zeus-Labs/ZeusCloud/rules/types"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/Zeus-Labs/ZeusCloud/rules"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"gorm.io/gorm"
)

var ExecuteRules bool = false
var ExecuteRulesMutex sync.Mutex

type StatusResponse struct {
	Status      string  `json:"status"`
	RunningTime float64 `json:"running_time,omitempty"`
}

type CartographyJobRequest struct {
	AccountName        string `json:"account_name"`
	Profile            string `json:"profile,omitempty"`
	AwsAccessKeyId     string `json:"aws_access_key_id,omitempty"`
	AwsSecretAccessKey string `json:"aws_secret_access_key,omitempty"`
	DefaultRegion      string `json:"default_region,omitempty"`
}

// RuleExecutionLoop tries to execute rules when
// 1) The ExecuteRules boolean is true
// 2) The cartography job is not running.
// When these conditions are true, it also marks ExecuteRules false.
// And it sets the LastScanCompleted field - right now, for *all* accounts
func RuleExecutionLoop(postgresDb *gorm.DB, driver neo4j.Driver, ruleDataList []models.RuleData,
	rulesToExecute []types.Rule) {

	for {
		time.Sleep(time.Second * 20)

		// Check whether rules should be executed
		ExecuteRulesMutex.Lock()
		if !ExecuteRules {
			ExecuteRulesMutex.Unlock()
			continue
		}
		ExecuteRulesMutex.Unlock()

		// Check cartography job is not running
		resp, err := http.Get(os.Getenv("CARTOGRAPHY_URI") + "/get_status")
		if err != nil {
			log.Printf("Error fetching cartography job status: %v", err)
			continue
		}
		var sr StatusResponse
		if err := json.NewDecoder(resp.Body).Decode(&sr); err != nil {
			log.Printf("Error parsing cartography job status: %v", err)
			resp.Body.Close()
			continue
		}
		resp.Body.Close()
		if sr.Status != "READY" {
			continue
		}

		// Execute rules
		for idx, r := range rulesToExecute {
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

			rd := ruleDataList[idx]

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

		// Set LastScanCompleted of every row in account_details
		postgresDb.Model(&models.AccountDetails{}).Where("1 = 1").Update("last_scan_completed", time.Now())

		// Reset ExecuteRules boolean
		ExecuteRulesMutex.Lock()
		ExecuteRules = false
		ExecuteRulesMutex.Unlock()
	}
}

// TriggerScan attempts to
//  1. Start a cartography job
//  2. If the job was started or is already running, mark ExecuteRules boolean
//     so the RuleExecutionLoop can run.
func TriggerScan(postgresDb *gorm.DB) error {
	// TODO: Read / parse credentials from database or request
	var accountDetailsLst []models.AccountDetails
	if tx := postgresDb.Find(&accountDetailsLst); tx.Error != nil {
		return tx.Error
	}
	if len(accountDetailsLst) == 0 {
		// No account details found, so skip cartography scanning
		return nil
	}
	if len(accountDetailsLst) > 1 {
		return fmt.Errorf("expected only 1 account details from db, got %v", len(accountDetailsLst))
	}

	var cjr CartographyJobRequest
	if accountDetailsLst[0].ConnectionMethod == "profile" {
		cjr = CartographyJobRequest{
			AccountName: accountDetailsLst[0].AccountName,
			Profile:     accountDetailsLst[0].Profile,
		}
	} else if accountDetailsLst[0].ConnectionMethod == "access_key" {
		cjr = CartographyJobRequest{
			AccountName:        accountDetailsLst[0].AccountName,
			AwsAccessKeyId:     string(accountDetailsLst[0].AwsAccessKeyId),
			AwsSecretAccessKey: string(accountDetailsLst[0].AwsSecretAccessKey),
			DefaultRegion:      accountDetailsLst[0].DefaultRegion,
		}
	} else {
		return fmt.Errorf("invalid connection method: %v", accountDetailsLst[0].ConnectionMethod)
	}

	// Attempt to start cartography job
	cjrJSON, err := json.Marshal(cjr)
	if err != nil {
		return err
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
		return fmt.Errorf("starting cartography job failed")
	}

	// Mark RuleExecutionLoop to execute rules
	ExecuteRulesMutex.Lock()
	ExecuteRules = true
	ExecuteRulesMutex.Unlock()

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
