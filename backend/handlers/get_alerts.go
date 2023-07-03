package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/gorm"
)

type RuleAlerts struct {
	RuleAlertsGroup []RuleAlert `json:"rule_alerts_group"`
}

// RuleAlert has the rule data and the associated alerts
type RuleAlert struct {
	RuleData       models.RuleData `json:"rule_data"`
	AlertInstances []AlertInstance `json:"alert_instances"`
}

// AlertInstance has the data of the alert from the rule
type AlertInstance struct {
	ResourceID   string    `json:"resource_id"`
	ResourceType string    `json:"resource_type"`
	AccountID    string    `json:"account_id"`
	Context      string    `json:"context"`
	Status       string    `json:"status"`
	FirstSeen    time.Time `json:"first_seen"`
	LastSeen     time.Time `json:"last_seen"`
	Muted        bool      `json:"muted"`
}

func GetAllAlerts(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		ruleCategory := r.URL.Query().Get("rulecategory")

		// Check if rule category is valid.
		var ruleCategoryMap = map[string]bool{"attackpath": true, "all": true, "misconfiguration": true, "vulnerability": true}
		if _, ok := ruleCategoryMap[ruleCategory]; !ok {
			log.Println("Invalid rule category provided")
			http.Error(w, "Invalid rule category provided provided", 500)
			return
		}

		var ruleResultLst []models.RuleResult
		tx := postgresDb.Find(&ruleResultLst)
		if tx.Error != nil {
			log.Printf("failed to retrieve rule data's: %v", tx.Error)
			http.Error(w, "failed get rules", 500)
			return
		}

		// Map rule data uid to alert instance.
		ruleIdToAlertMap := make(map[string][]AlertInstance)
		for _, ruleResult := range ruleResultLst {

			_, ok := ruleIdToAlertMap[ruleResult.RuleDataUID]
			alertInstance := AlertInstance{
				ResourceID:   ruleResult.ResourceID,
				ResourceType: ruleResult.ResourceType,
				AccountID:    ruleResult.AccountID,
				Context:      ruleResult.Context,
				Status:       ruleResult.Status,
				FirstSeen:    ruleResult.FirstSeen,
				LastSeen:     ruleResult.LastSeen,
				Muted:        ruleResult.Muted,
			}
			if !ok {
				ruleIdToAlertMap[ruleResult.RuleDataUID] = []AlertInstance{}
			}
			ruleIdToAlertMap[ruleResult.RuleDataUID] = append(ruleIdToAlertMap[ruleResult.RuleDataUID], alertInstance)
		}

		// Mape rule id to rule data.
		var ruleDataLst []models.RuleData
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

		ruleIdToRuleData := make(map[string]models.RuleData)
		for _, ruleData := range ruleDataLst {
			_, ok := ruleIdToRuleData[ruleData.UID]
			if !ok {
				ruleIdToRuleData[ruleData.UID] = ruleData
			}
		}

		var ruleAlerts RuleAlerts
		for ruleId, ruleData := range ruleIdToRuleData {
			alertInstances, ok := ruleIdToAlertMap[ruleId]
			if !ok {
				alertInstances = []AlertInstance{}
			}
			ruleAlerts.RuleAlertsGroup = append(ruleAlerts.RuleAlertsGroup, RuleAlert{
				RuleData:       ruleData,
				AlertInstances: alertInstances,
			})
		}

		retDataBytes, err := json.Marshal(ruleAlerts)
		if err != nil {
			log.Printf("failed to marshal ruleDataLsts: %v", err)
			http.Error(w, "failed get rules alerts", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
