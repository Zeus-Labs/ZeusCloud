package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AccountError struct {
	Error     error
	ErrorCode int
}

type AccountName struct {
	AccountName string `json:"account_name"`
}

func GetAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var accountDetailsLst []models.AccountDetails
		tx := postgresDb.Select("account_name", "connection_method", "profile", "default_region", "last_scan_completed", "scan_status", "running_time").Find(&accountDetailsLst)
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

func ManualAddAccountDetails(postgresDb *gorm.DB, ad models.AccountDetails) AccountError {
	var accountDetailsLst []models.AccountDetails
	if tx := postgresDb.Find(&accountDetailsLst); tx.Error != nil {
		log.Printf("failed to retrieve account details: %v", tx.Error)
		return AccountError{
			Error:     errors.New("failed to retrieve account details"),
			ErrorCode: 400,
		}
	}

	if ad.ConnectionMethod != "profile" && ad.ConnectionMethod != "access_key" {
		log.Printf("Invalid connection method: %v", ad.ConnectionMethod)
		return AccountError{
			Error:     errors.New("Invalid connection method. Must be profile or access_key"),
			ErrorCode: 400,
		}
	}
	if ad.ConnectionMethod == "profile" {
		apr, err := control.GetAwsProfiles()
		if err != nil {
			log.Printf("Failed to find available aws profiles: %v", err)
			return AccountError{
				Error:     errors.New("Failed to find available aws profiles"),
				ErrorCode: 500,
			}
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
			return AccountError{
				Error:     errors.New("invalid profile"),
				ErrorCode: 400,
			}
		}
		ad.AwsAccessKeyId = ""
		ad.AwsSecretAccessKey = ""
		ad.DefaultRegion = ""
	} else {
		ad.Profile = ""
	}
	ad.LastScanCompleted = nil
	ad.ScanStatus = "READY"
	ad.RunningTime = 0
	// Attempt to insert into database
	tx := postgresDb.Clauses(clause.OnConflict{DoNothing: true}).Create(&ad)
	if tx.Error != nil {
		log.Printf("failed to add account details: %v", tx.Error)
		return AccountError{
			Error:     errors.New("failed to add account details"),
			ErrorCode: 400,
		}
	}
	if tx.RowsAffected != 1 {
		errorStr := fmt.Sprintf("expected 1 row to be affected not %v", tx.RowsAffected)
		log.Printf(errorStr)
		return AccountError{
			Error:     errors.New("duplicate account"),
			ErrorCode: 400,
		}
	}

	return AccountError{
		Error:     nil,
		ErrorCode: 200,
	}
}

func AddAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Validate account details
		var ad models.AccountDetails
		if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}

		accountError := ManualAddAccountDetails(postgresDb, ad)
		if accountError.ErrorCode != 200 || accountError.Error != nil {
			log.Printf("Adding account error %+v", accountError)
			http.Error(w, accountError.Error.Error(), accountError.ErrorCode)
			return
		}
	}
}

func DeleteAccountDetails(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

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
		var ad AccountName
		if err := json.NewDecoder(r.Body).Decode(&ad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		log.Printf("account name: %v", ad.AccountName)
		if err := control.QueueAccountsToBeScanned(postgresDb, ad.AccountName); err != nil {
			log.Printf("failed to trigger scan: %v", err)
			http.Error(w, "failed to trigger scan", 500)
			return
		}
	}
}

func GetAwsProfiles() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		apr, err := control.GetAwsProfiles()
		if err != nil {
			log.Printf("failed to get aws profiles: %v", err)
			http.Error(w, "failed to get aws profiles", 500)
			return
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
