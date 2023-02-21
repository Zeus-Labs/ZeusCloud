package handlers

import (
	"encoding/json"
	"log"
	"math"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/models"

	"github.com/Zeus-Labs/ZeusCloud/compliance"
	"gorm.io/gorm"
)

type ComplianceFrameworkStats struct {
	FrameworkName          string `json:"framework_name"`
	RulesPassingPercentage int    `json:"rule_passing_percentage"`
}

func GetComplianceFrameworkStats(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Validate framework name
		frameworkID := r.URL.Query().Get("framework_id")
		spec, ok := compliance.FrameworkIDToSpec[frameworkID]
		if !ok {
			log.Printf("failed to retrieve framework spec for id %v", frameworkID)
			http.Error(w, "invalid framework name", 400)
			return
		}

		totalRules := 0
		totalRulesPassing := 0
		// Put together compliance framework
		var framework ComplianceFrameworkStats
		framework.FrameworkName = spec.FrameworkName

		for _, groupSpec := range spec.ComplianceControlGroupSpecs {
			//group := ComplianceControlGroup{GroupName: groupSpec.GroupName}
			for _, controlSpec := range groupSpec.ComplianceControlSpecs {
				// Get rules for every single compliance control. If it has no alerts
				// or all alerts are passing it works well.
				for _, ruleId := range controlSpec.ZeusCloudRules {

					// Get alerts for every rule id.
					var ruleResultLst []models.RuleResult
					tx := postgresDb.Where("rule_data_uid = ?", ruleId.UID()).Find(&ruleResultLst)
					if tx.Error != nil {
						log.Printf("failed to retrieve rule results: %v", tx.Error)
						http.Error(w, "failed get compliance framework", 500)
						return
					}

					totalRules += 1
					alertFailed := false
					for _, ruleResult := range ruleResultLst {
						if ruleResult.Status == "failed" {
							alertFailed = true
							break
						}
					}
					if !alertFailed {
						totalRulesPassing += 1
					}
				}
			}
		}
		framework.RulesPassingPercentage = int(math.Round(float64(100*totalRulesPassing) / float64(totalRules)))
		retDataBytes, err := json.Marshal(framework)
		if err != nil {
			log.Printf("failed to marshal ComplianceFramework: %v", err)
			http.Error(w, "failed get compliance framework", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
