package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/gorm"
)

type ToggleRuleActiveData struct {
	UID    string `json:"uid"`
	Active bool   `json:"active"`
}

func ToggleRuleActive(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var trad ToggleRuleActiveData
		if err := json.NewDecoder(r.Body).Decode(&trad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}
		tx := postgresDb.Model(&models.RuleData{}).Where("uid = ?", trad.UID).Update("active", trad.Active)
		if tx.Error != nil {
			log.Printf("failed to update active field: %v", tx.Error)
			http.Error(w, "failed to toggle active status", 400)
			return
		}
		if tx.RowsAffected != 1 {
			log.Printf("expected 1 row to be affected not %v", tx.RowsAffected)
			http.Error(w, "invalid uid", 400)
			return
		}
	}
}
