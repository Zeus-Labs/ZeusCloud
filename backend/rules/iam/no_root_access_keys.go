package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type NoRootAccessKeys struct{}

func (NoRootAccessKeys) UID() string {
	return "iam/no_root_access_keys"
}

func (NoRootAccessKeys) Description() string {
	return "No root account access keys should exist."
}

func (NoRootAccessKeys) Severity() types.Severity {
	return types.Critical
}

func (NoRootAccessKeys) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (NoRootAccessKeys) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:CredentialReportUser)
		WHERE u.user = '<root_account>'
		RETURN u.arn as resource_id,
		'AWSUser' as resource_type,
		a.id as account_id,
		CASE
			WHEN u.access_key_1_active THEN 'failed'
			WHEN u.access_key_2_active THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN u.access_key_1_active THEN 'Access key 1 is active for root account.'
			WHEN u.access_key_2_active THEN 'Access key 2 is active for root account.'
			ELSE 'No active access keys found for root account.'
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

func (NoRootAccessKeys) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
