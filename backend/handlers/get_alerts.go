package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
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
	CrownJewel   bool      `json:"crown_jewel"`
}

var resourceTypeToIdFieldMap = map[string]string{
	"AWSUser":          "arn",
	"AWSPrincipal":     "arn",
	"AWSPolicy":        "id",
	"AWSGroup":         "arn",
	"EC2Instance":      "id",
	"AWSLambda":        "id",
	"S3Bucket":         "id",
	"RDSInstance":      "arn",
	"AWSVpc":           "id",
	"EC2SecurityGroup": "id",
	"LoadBalancerV2":   "id",
	"KMSKey":           "id",
}

type crownJewelNodeInfo struct {
	idList  []string
	arnList []string
}

func getCrownJewelResources(tx neo4j.Transaction) (crownJewelNodeInfo, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(n {is_crown_jewel:True})
		WITH collect(n.id) as nodeIdLst, collect(n.arn) as nodeArnLst
		RETURN nodeIdLst,nodeArnLst`,
		nil)

	if err != nil {
		return crownJewelNodeInfo{}, err
	}
	var crownJewelNodes crownJewelNodeInfo
	for records.Next() {
		record := records.Record()
		nodeIdLst, _ := record.Get("nodeIdLst")
		nodeIdStrList, err := CastToStrLst(nodeIdLst, "Node id list should be  slice of strings")
		if err != nil {
			return crownJewelNodeInfo{}, err
		}

		nodeArnLst, _ := record.Get("nodeArnLst")
		nodeArnStrList, err := CastToStrLst(nodeArnLst, "Node arn list should be  slice of strings")
		if err != nil {
			return crownJewelNodeInfo{}, err
		}

		crownJewelNodes = crownJewelNodeInfo{
			idList:  nodeIdStrList,
			arnList: nodeArnStrList,
		}
	}
	return crownJewelNodes, nil
}

func GetAllAlerts(postgresDb *gorm.DB, driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
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

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeRead,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		result, err := session.ReadTransaction(func(neo4jTx neo4j.Transaction) (interface{}, error) {

			var ruleResultLst []models.RuleResult
			tx := postgresDb.Find(&ruleResultLst)
			if tx.Error != nil {
				return nil, fmt.Errorf("failed to retrieve rule data's: %v", tx.Error)
			}

			crownJewelNodesStruct, err := getCrownJewelResources(neo4jTx)
			if err != nil {
				return nil, err
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
					CrownJewel:   false,
				}

				resourceIdField, isResourceTypePresent := resourceTypeToIdFieldMap[alertInstance.ResourceType]
				if isResourceTypePresent {
					switch resourceIdField {
					case "id":
						alertInstance.CrownJewel = Contains(crownJewelNodesStruct.idList, alertInstance.ResourceID)

					case "arn":
						alertInstance.CrownJewel = Contains(crownJewelNodesStruct.arnList, alertInstance.ResourceID)
					}
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
				return nil, fmt.Errorf("failed to retrieve rule data's: %v", tx.Error)
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
			return ruleAlerts, nil
		})

		if err != nil {
			log.Printf("failed to retrieve rule alerts data: %v", err)
			http.Error(w, "failed get rules alerts", 500)
			return
		}

		retDataBytes, err := json.Marshal(result)
		if err != nil {
			log.Printf("failed to marshal ruleDataLsts: %v", err)
			http.Error(w, "failed get rules alerts", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
