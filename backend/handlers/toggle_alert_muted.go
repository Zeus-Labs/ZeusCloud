package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/IronLeap/IronCloud/models"
	"gorm.io/gorm"
)

type AlertActive struct {
	ResourceID  string `json:"resource_id"`
	RuleDataUID string `json:"rule_data_uid"`
}

type ToggleAlertMutedData struct {
	AlertId       AlertActive `json:"alert_id"`
	NewMutedValue bool        `json:"new_muted_value"`
}

func ToggleAlertMuted(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		var trad ToggleAlertMutedData
		if err := json.NewDecoder(r.Body).Decode(&trad); err != nil {
			log.Printf("failed to decode json body: %v", err)
			http.Error(w, "failed to decode json body", 400)
			return
		}

		tx := postgresDb.Model(&models.RuleResult{}).Where("rule_data_uid = ?", trad.AlertId.RuleDataUID).Where(
			"resource_id = ?", trad.AlertId.ResourceID).Update("muted", trad.NewMutedValue)
		if tx.Error != nil {
			log.Printf("failed to update active field: %v", tx.Error)
			http.Error(w, "failed to toggle alert muted status", 400)
			return
		}

		if tx.RowsAffected != 1 {
			log.Printf("expected 1 row to be affected not %v", tx.RowsAffected)
			http.Error(w, "invalid uid", 400)
			return
		}
	}
}
