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
		tx := postgresDb.Select("account_name", "default_region", "last_scan_completed").Find(&accountDetailsLst)
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
			http.Error(w, "Sorry! ZeusCloud only supports 1 account currently.", 400)
			return
		}

		var ad models.AccountDetails
		if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}
		ad.LastScanCompleted = nil
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
		if os.Getenv("MODE") != constants.DemoEnvModeStr {
			sr, err := control.GetScanStatus()
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
