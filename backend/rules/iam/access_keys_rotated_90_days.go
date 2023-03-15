package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type AccessKeysRotated90Days struct{}

func (AccessKeysRotated90Days) UID() string {
	return "iam/access_keys_rotated_90_days"
}

func (AccessKeysRotated90Days) Description() string {
	return "User access keys should be rotated every 90 days or less"
}

func (AccessKeysRotated90Days) Severity() types.Severity {
	return types.Moderate
}

func (AccessKeysRotated90Days) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (AccessKeysRotated90Days) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:CredentialReportUser)
		WITH a, u, datetime().epochSeconds as currentTime, 90 * 24 * 60 * 60 as ninetyDays
		RETURN u.arn as resource_id, 
		'AWSUser' as resource_type,
		a.id as account_id,
		CASE 
			WHEN (
				u.access_key_1_active AND 
				currentTime - u.user_creation_time >= ninetyDays AND
				(u.access_key_1_last_rotated IS NULL OR currentTime - u.access_key_1_last_rotated >= ninetyDays)
			) THEN 'failed'
			WHEN (
				u.access_key_2_active AND 
				currentTime - u.user_creation_time >= ninetyDays AND
				(u.access_key_2_last_rotated IS NULL OR currentTime - u.access_key_2_last_rotated >= ninetyDays)
			) THEN 'failed' 
			ELSE 'passed' 
		END as status,
		CASE 
			WHEN (
				u.access_key_1_active AND 
				currentTime - u.user_creation_time >= ninetyDays AND
				(u.access_key_1_last_rotated IS NULL OR currentTime - u.access_key_1_last_rotated >= ninetyDays)
			) THEN 'The user\'s access key 1 has not been rotated in over 90 days.'
			WHEN (
				u.access_key_2_active AND 
				currentTime - u.user_creation_time >= ninetyDays AND
				(u.access_key_2_last_rotated IS NULL OR currentTime - u.access_key_2_last_rotated >= ninetyDays)
			) THEN 'The user\'s access key 2 has not been rotated in over 90 days.'
			ELSE 'The user has no access keys due for rotation.' 
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

func (AccessKeysRotated90Days) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
