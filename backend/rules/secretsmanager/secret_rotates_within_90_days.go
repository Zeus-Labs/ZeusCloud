package secretsmanager

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecretRotatesWithin90Days struct{}

func (SecretRotatesWithin90Days) UID() string {
	return "secretsmanager/secret_rotates_within_90_days"
}

func (SecretRotatesWithin90Days) Description() string {
	return "Secret manager secrets should be configured to and should successfully rotate within 90 days."
}

func (SecretRotatesWithin90Days) Severity() types.Severity {
	return types.Low
}

func (SecretRotatesWithin90Days) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (SecretRotatesWithin90Days) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:SecretsManagerSecret)
		WITH a, s, datetime().epochSeconds as currentTime, 90 * 24 * 60 * 60 as ninetyDays
		RETURN s.id as resource_id,
		'SecretsManagerSecret' as resource_type,
		a.id as account_id, 
		CASE WHEN 
		  s.rotation_rules_automatically_after_days is not NULL AND
		  s.rotation_rules_automatically_after_days <= 90 AND
		  (
			  (s.last_rotated_date is NULL AND currentTime - s.created_date <= ninetyDays) OR
			  (s.last_rotated_date is not NULL AND currentTime - s.last_rotated_date <= ninetyDays)
		  )
		THEN 'passed' ELSE 'failed' END as status,
		CASE 
			WHEN s.rotation_rules_automatically_after_days is NULL THEN 'The secret is not configured to automatically rotate.'
		  	WHEN s.rotation_rules_automatically_after_days > 90 THEN 'The secret is not configured to automatically rotate every ' + toString(s.rotation_rules_automatically_after_days) + ' days.' 
		    WHEN s.last_rotated_date is NULL AND currentTime - s.created_date <= ninetyDays THEN 'The secret was created less than 90 days ago and is configured to automatically rotate within 90 days.'
			WHEN s.last_rotated_date is not NULL AND currentTime - s.last_rotated_date <= ninetyDays THEN 'The secret is configured to automatically rotate within 90 days, and it has successfully rotated in the past 90 days.'
			ELSE 'The secret is configured to automatically rotate within 90 days, but has not successfully rotated in the past 90 days.'
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
