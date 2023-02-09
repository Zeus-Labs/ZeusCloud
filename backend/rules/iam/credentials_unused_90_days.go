package iam

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type CredentialsUnused90Days struct{}

func (CredentialsUnused90Days) UID() string {
	return "iam/credentials_unused_90_days"
}

func (CredentialsUnused90Days) Description() string {
	return "IAM credentials (access keys and passwords) unused for 90 days or more should be disabled."
}

func (CredentialsUnused90Days) Severity() types.Severity {
	return types.Critical
}

func (CredentialsUnused90Days) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (CredentialsUnused90Days) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:CredentialReportUser)
		WHERE u.user <> '<root_account>'
		WITH a, u, datetime().epochSeconds as currentTime, 90 * 24 * 60 * 60 as ninetyDays
		RETURN u.arn as resource_id,
		'AWSUser' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN u.password_enabled AND u.password_last_used IS NULL AND currentTime - u.password_last_changed >= ninetyDays THEN 'failed'
			WHEN u.password_enabled AND u.password_last_used IS NOT NULL AND currentTime - u.password_last_used >= ninetyDays THEN 'failed'
			WHEN u.access_key_1_active AND u.access_key_1_last_used_date IS NULL AND currentTime - u.access_key_1_last_rotated >= ninetyDays THEN 'failed'
			WHEN u.access_key_1_active AND u.access_key_1_last_used_date IS NOT NULL AND currentTime - u.access_key_1_last_used_date >= ninetyDays THEN 'failed'
			WHEN u.access_key_2_active AND u.access_key_2_last_used_date IS NULL AND currentTime - u.access_key_2_last_rotated >= ninetyDays THEN 'failed'
			WHEN u.access_key_2_active AND u.access_key_2_last_used_date IS NOT NULL AND currentTime - u.access_key_2_last_used_date >= ninetyDays THEN 'failed'
			ELSE 'passed' 
		END as status,
		CASE 
			WHEN u.password_enabled AND u.password_last_used IS NULL AND currentTime - u.password_last_changed >= ninetyDays THEN 'The user\'s password was created over 90 days ago but never used.'
			WHEN u.password_enabled AND u.password_last_used IS NOT NULL AND currentTime - u.password_last_used >= ninetyDays THEN 'The user\'s password has not been used for over 90 days.'
			WHEN u.access_key_1_active AND u.access_key_1_last_used_date IS NULL AND currentTime - u.access_key_1_last_rotated >= ninetyDays THEN 'The user\'s access key 1 was created over 90 days ago but never used.'
			WHEN u.access_key_1_active AND u.access_key_1_last_used_date IS NOT NULL AND currentTime - u.access_key_1_last_used_date >= ninetyDays THEN 'The user\'s access key 1 has not been used for over 90 days.'
			WHEN u.access_key_2_active AND u.access_key_2_last_used_date IS NULL AND currentTime - u.access_key_2_last_rotated >= ninetyDays THEN 'The user\'s access key 2 was created over 90 days ago but never used.'
			WHEN u.access_key_2_active AND u.access_key_2_last_used_date IS NOT NULL AND currentTime - u.access_key_2_last_used_date >= ninetyDays THEN 'The user\'s access key 2 has not been used for over 90 days.'
			ELSE 'The user has no credentials that have been unused for more than 90 days.' 
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
