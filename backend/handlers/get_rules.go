package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/gorm"
)

func GetRules(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		ruleCategory := r.URL.Query().Get("rulecategory")

		// Check if rule category is valid.
		var ruleCategoryMap = map[string]bool{"attackpath": true, "all": true, "misconfiguration": true}
		if _, ok := ruleCategoryMap[ruleCategory]; !ok {
			log.Println("Invalid rule category provided")
			http.Error(w, "Invalid rule category provided provided", 500)
			return
		}

		var ruleDataLst []models.RuleData
		var tx *gorm.DB
		if ruleCategory == "all" {
			tx = postgresDb.Find(&ruleDataLst)
		} else {
			tx = postgresDb.Where("rule_category = ?", ruleCategory).Find(&ruleDataLst)
		}

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
