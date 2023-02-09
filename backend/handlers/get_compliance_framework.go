package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/IronLeap/IronCloud/compliance"
	"github.com/IronLeap/IronCloud/models"
	"gorm.io/gorm"
)

type ComplianceFramework struct {
	FrameworkName           string                   `json:"framework_name"`
	ComplianceControlGroups []ComplianceControlGroup `json:"compliance_control_groups"`
}

type ComplianceControlGroup struct {
	GroupName          string              `json:"group_name"`
	ComplianceControls []ComplianceControl `json:"compliance_controls"`
}

type ComplianceControl struct {
	ControlName     string      `json:"control_name"`
	RuleAlertsGroup []RuleAlert `json:"rule_alerts_group"`
	Comment         string      `json:"comment"`
}

func GetComplianceFramework(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Validate framework name
		frameworkID := r.URL.Query().Get("framework_id")
		spec, ok := compliance.FrameworkIDToSpec[frameworkID]
		if !ok {
			log.Printf("failed to retrieve framework spec for id %v", frameworkID)
			http.Error(w, "invalid framework name", 400)
			return
		}

		// Map rule data uid to alert instance.
		var ruleResultLst []models.RuleResult
		tx := postgresDb.Find(&ruleResultLst)
		if tx.Error != nil {
			log.Printf("failed to retrieve rule results: %v", tx.Error)
			http.Error(w, "failed get compliance framework", 500)
			return
		}
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
		tx = postgresDb.Find(&ruleDataLst)
		if tx.Error != nil {
			log.Printf("failed to retrieve rule data: %v", tx.Error)
			http.Error(w, "failed get compliance framework", 500)
			return
		}
		ruleIdToRuleData := make(map[string]models.RuleData)
		for _, ruleData := range ruleDataLst {
			_, ok := ruleIdToRuleData[ruleData.UID]
			if !ok {
				ruleIdToRuleData[ruleData.UID] = ruleData
			}
		}

		// Put together compliance framework
		var framework ComplianceFramework
		framework.FrameworkName = spec.FrameworkName
		for _, groupSpec := range spec.ComplianceControlGroupSpecs {
			group := ComplianceControlGroup{GroupName: groupSpec.GroupName}
			for _, controlSpec := range groupSpec.ComplianceControlSpecs {
				control := ComplianceControl{
					ControlName:     controlSpec.ControlName,
					Comment:         controlSpec.Comment,
					RuleAlertsGroup: make([]RuleAlert, 0)}
				for _, ruleId := range controlSpec.IronCloudRules {
					mappedRuleData, ok := ruleIdToRuleData[ruleId.UID()]
					if !ok {
						log.Printf("issue matching rules and alerts")
						http.Error(w, "failed get compliance framework", 500)
						return
					}

					mappedAlertInstances, ok := ruleIdToAlertMap[ruleId.UID()]
					if !ok {
						mappedAlertInstances = make([]AlertInstance, 0)
					}

					control.RuleAlertsGroup = append(control.RuleAlertsGroup, RuleAlert{
						RuleData:       mappedRuleData,
						AlertInstances: mappedAlertInstances,
					})
				}
				group.ComplianceControls = append(group.ComplianceControls, control)
			}
			framework.ComplianceControlGroups = append(framework.ComplianceControlGroups, group)
		}

		retDataBytes, err := json.Marshal(framework)
		if err != nil {
			log.Printf("failed to marshal ComplianceFramework: %v", err)
			http.Error(w, "failed get compliance framework", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
