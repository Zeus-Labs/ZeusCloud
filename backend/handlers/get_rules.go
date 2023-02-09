package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/IronLeap/IronCloud/models"
	"gorm.io/gorm"
)

func GetRules(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var ruleDataLst []models.RuleData
		tx := postgresDb.Find(&ruleDataLst)
		if tx.Error != nil {
			log.Printf("failed to retrieve rule data's: %v", tx.Error)
			http.Error(w, "failed get rules", 500)
			return
		}
		retDataBytes, err := json.Marshal(ruleDataLst)
		if err != nil {
			log.Printf("failed to marshal ruleDataLsts: %v", err)
			http.Error(w, "failed get rules", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
