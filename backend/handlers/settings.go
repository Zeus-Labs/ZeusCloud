package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/Zeus-Labs/ZeusCloud/constants"
	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func GetAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var accountDetailsLst []models.AccountDetails
		tx := postgresDb.Select("account_name", "connection_method", "profile", "default_region", "last_scan_completed").Find(&accountDetailsLst)
		if tx.Error != nil {
			log.Printf("failed to retrieve account details: %v", tx.Error)
			http.Error(w, "failed get account details", 500)
			return
		}
		retDataBytes, err := json.Marshal(accountDetailsLst)
		if err != nil {
			log.Printf("failed to marshal account details: %v", err)
			http.Error(w, "failed get account details", 500)
			return
		}
		w.Write(retDataBytes)
	}
}

func AddAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Only allow 1 account details row for now
		var accountDetailsLst []models.AccountDetails
		if tx := postgresDb.Find(&accountDetailsLst); tx.Error != nil {
			log.Printf("failed to retrieve account details: %v", tx.Error)
			http.Error(w, "failed get account details", 500)
			return
		}
		if len(accountDetailsLst) > 0 {
			log.Printf("Sorry! ZeusCloud only supports 1 account currently.")
			http.Error(w, "Sorry! ZeusCloud only supports 1 account currently.", 400)
			return
		}

		// Validate account details
		var ad models.AccountDetails
		if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}
		if ad.ConnectionMethod != "profile" && ad.ConnectionMethod != "access_key" {
			log.Printf("Invalid connection method: %v", ad.ConnectionMethod)
			http.Error(w, "Invalid connection method. Must be profile or access_key", 400)
			return
		}
		if ad.ConnectionMethod == "profile" {
			apr, err := control.GetAwsProfiles()
			if err != nil {
				log.Printf("Failed to find available aws profiles: %v", err)
				http.Error(w, "Failed to find available aws profiles", 500)
				return
			}
			var found bool
			for _, profile := range apr.AwsProfiles {
				if profile == ad.Profile {
					found = true
					break
				}
			}
			if !found {
				log.Printf("Invalid profile: %v. Expected one of %v", ad.Profile, apr.AwsProfiles)
				http.Error(w, "Invalid profile", 400)
				return
			}
			ad.AwsAccessKeyId = ""
			ad.AwsSecretAccessKey = ""
			ad.DefaultRegion = ""
		} else {
			ad.Profile = ""
		}
		ad.LastScanCompleted = nil

		// Attempt to insert into database
		tx := postgresDb.Clauses(clause.OnConflict{DoNothing: true}).Create(&ad)
		if tx.Error != nil {
			log.Printf("failed to add account details: %v", tx.Error)
			http.Error(w, "failed to add account details", 400)
			return
		}
		if tx.RowsAffected != 1 {
			log.Printf("expected 1 row to be affected not %v", tx.RowsAffected)
			http.Error(w, "duplicate account", 400)
			return
		}

		// Trigger scan
		if err := control.TriggerScan(postgresDb); err != nil {
			log.Printf("failed to trigger scan: %v", err)
			http.Error(w, "failed to trigger scan", 500)
			return
		}
	}
}

func DeleteAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var ad models.AccountDetails
		if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}
		tx := postgresDb.Where("account_name = ?", ad.AccountName).Delete(&models.AccountDetails{})
		if tx.Error != nil {
			log.Printf("failed to delete account details: %v", tx.Error)
			http.Error(w, "failed to delete account details", 400)
			return
		}
		if tx.RowsAffected != 1 {
			log.Printf("expected 1 row to be deleted not %v", tx.RowsAffected)
			http.Error(w, "malfunctioning delete", 400)
			return
		}
	}
}

func Rescan(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := control.TriggerScan(postgresDb); err != nil {
			log.Printf("failed to trigger scan: %v", err)
			http.Error(w, "failed to trigger scan", 500)
			return
		}
	}
}

func GetAccountScanInfo() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var sr control.StatusResponse
		var err error
		if os.Getenv("MODE") != constants.DemoEnvModeStr {
			sr, err = control.GetScanStatus()
			if err != nil {
				log.Printf("failed to determine if scan is running: %v", err)
				http.Error(w, "failed to determine if scan is running", 500)
				return
			}
			control.ExecuteRulesMutex.Lock()
			if sr.Status != "RUNNING" && control.ExecuteRules {
				sr.Status = "RULES_RUNNING"
			}
			control.ExecuteRulesMutex.Unlock()
		} else {
			sr = control.StatusResponse{
				Status: "READY",
			}
		}
		retDataBytes, err := json.Marshal(sr)
		if err != nil {
			log.Printf("failed to marshal status response: %v", err)
			http.Error(w, "failed to marshal status response", 500)
			return
		}
		w.Write(retDataBytes)
	}
}

func GetAwsProfiles() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var apr control.AwsProfilesResponse
		var err error
		if os.Getenv("MODE") != constants.DemoEnvModeStr {
			apr, err = control.GetAwsProfiles()
			if err != nil {
				log.Printf("failed to get aws profiles: %v", err)
				http.Error(w, "failed to get aws profiles", 500)
				return
			}
		} else {
			apr = control.AwsProfilesResponse{
				AwsProfiles: make([]string, 0),
			}
		}
		retDataBytes, err := json.Marshal(apr)
		if err != nil {
			log.Printf("failed to marshal aws profiles response: %v", err)
			http.Error(w, "failed to fetch aws profiles", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
