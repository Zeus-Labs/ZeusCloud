package secretsmanager

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecretUnused90Days struct{}

func (SecretUnused90Days) UID() string {
	return "secretsmanager/secret_unused_90_days"
}

func (SecretUnused90Days) Description() string {
	return "Unused secret manager secrets should be removed."
}

func (SecretUnused90Days) Severity() types.Severity {
	return types.Low
}

func (SecretUnused90Days) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
		types.UnusedResource,
	}
}

func (SecretUnused90Days) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:SecretsManagerSecret)
		WITH a, s, datetime().epochSeconds as currentTime, 90 * 24 * 60 * 60 as ninetyDays
		RETURN s.id as resource_id,
		'SecretsManagerSecret' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN s.last_accessed_date is NULL AND currentTime - s.created_date <= ninetyDays THEN 'passed'
			WHEN s.last_accessed_date is not NULL AND currentTime - s.last_accessed_date <= ninetyDays THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN s.last_accessed_date is NULL AND currentTime - s.created_date <= ninetyDays THEN 'The secret has not been used, but was created less than 90 days ago.'
			WHEN s.last_accessed_date is not NULL AND currentTime - s.last_accessed_date <= ninetyDays THEN 'The secret has been used in the past 90 days.'
			ELSE 'The secret is unused for the past 90 days.'
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

func (SecretUnused90Days) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
