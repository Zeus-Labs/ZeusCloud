package securityhub

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type EnableSecurityHub struct{}

func (EnableSecurityHub) UID() string {
	return "securityhub/enable_security_hub"
}

func (EnableSecurityHub) Description() string {
	return "Security Hub should be enabled."
}

func (EnableSecurityHub) Severity() types.Severity {
	return types.Moderate
}

func (EnableSecurityHub) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{}
}

func (EnableSecurityHub) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})
		OPTIONAL MATCH (a)-[:RESOURCE]->(h:SecurityHub)
		WITH a, COUNT(h) as num_hubs
		RETURN a.id as resource_id,
		'AWSAccount' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN num_hubs = 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_hubs = 0 THEN 'SecurityHub is not enabled.'
			ELSE 'SecurityHub is enabled.'
		END as context`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var results []types.Result
	for records.Next() {
		record := records.Record()
		resourceID, _ := record.Get("resource_id")
		resourceIDStr, ok := resourceID.(string)
		if !ok {
			return nil, fmt.Errorf("resource_id %v should be of type string", resourceID)
		}
		resourceType, _ := record.Get("resource_type")
		resourceTypeStr, ok := resourceType.(string)
		if !ok {
			return nil, fmt.Errorf("resource_type %v should be of type string", resourceType)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountID)
		}
		status, _ := record.Get("status")
		statusStr, ok := status.(string)
		if !ok {
			return nil, fmt.Errorf("status %v should be of type string", status)
		}
		context, _ := record.Get("context")
		contextStr, ok := context.(string)
		if !ok {
			return nil, fmt.Errorf("context %v should be of type string", context)
		}
		results = append(results, types.Result{
			ResourceID:   resourceIDStr,
			ResourceType: resourceTypeStr,
			AccountID:    accountIDStr,
			Status:       statusStr,
			Context:      contextStr,
		})
	}
	return results, nil
}
