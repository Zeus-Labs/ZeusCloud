package iam

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type AvoidAccessKeysAtSetup struct{}

func (AvoidAccessKeysAtSetup) UID() string {
	return "iam/avoid_access_keys_at_setup"
}

func (AvoidAccessKeysAtSetup) Description() string {
	return "Access keys should not be set up at initial user setup for IAM users with passwords."
}

func (AvoidAccessKeysAtSetup) Severity() types.Severity {
	return types.Moderate
}

func (AvoidAccessKeysAtSetup) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (AvoidAccessKeysAtSetup) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:CredentialReportUser)
		WHERE u.user <> '<root_account>'
		RETURN u.arn as resource_id, 
		'AWSUser' as resource_type,
		a.id as account_id,
		CASE 
			WHEN u.password_enabled AND u.access_key_1_last_rotated - u.user_creation_time < 15 THEN 'failed' 
			ELSE 'passed'
		END as status,
		CASE 
			WHEN u.password_enabled IS NULL OR NOT u.password_enabled THEN 'IAM user does not have a password.'
			WHEN u.access_key_1_last_rotated IS NULL THEN 'IAM user does not have an access key.'
			WHEN u.password_enabled AND u.access_key_1_last_rotated - u.user_creation_time < 15 THEN 'IAM user has a password and an access key created during user setup.'
			ELSE 'IAM user has a password and an access key not created during user setup.'
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
