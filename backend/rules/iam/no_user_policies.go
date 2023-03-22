package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type NoUserPolicies struct{}

func (NoUserPolicies) UID() string {
	return "iam/no_user_policies"
}

func (NoUserPolicies) Description() string {
	return "IAM policies should not be connected to IAM users, but rather groups and roles."
}

func (NoUserPolicies) Severity() types.Severity {
	return types.Low
}

func (NoUserPolicies) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (NoUserPolicies) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:AWSUser)
		OPTIONAL MATCH (u)-[:POLICY]->(p:AWSPolicy)
		WITH a, u, sum(CASE WHEN p IS NULL THEN 0 ELSE 1 END) as num_user_policies
		RETURN u.arn as resource_id,
		'AWSUser' as resource_type,
		a.id as account_id,   
		CASE 
			WHEN num_user_policies > 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_user_policies > 0 THEN toString(num_user_policies) + ' IAM policies are attached to the user.'
			ELSE 'No IAM policies are connected the user.'
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

func (NoUserPolicies) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
