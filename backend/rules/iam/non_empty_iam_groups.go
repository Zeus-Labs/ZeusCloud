package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type NonEmptyIAMGroups struct{}

func (NonEmptyIAMGroups) UID() string {
	return "iam/non_empty_iam_groups"
}

func (NonEmptyIAMGroups) Description() string {
	return "There is at least 1 AWS IAM user per AWS IAM group."
}

func (NonEmptyIAMGroups) Severity() types.Severity {
	return types.Low
}

func (NonEmptyIAMGroups) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
		types.UnusedResource,
	}
}

func (NonEmptyIAMGroups) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(g:AWSGroup)
		OPTIONAL MATCH (g)<-[:MEMBER_AWS_GROUP]-(u:AWSUser)
		WITH a, g, sum(CASE WHEN u IS NULL THEN 0 ELSE 1 END) as num_users 
		RETURN g.arn as resource_id,
		'AWSGroup' as resource_type,
		a.id as account_id,   
		CASE 
			WHEN num_users > 0 THEN 'passed' 
			ELSE 'failed'
		END as status,
		CASE 
			WHEN num_users > 0 THEN 'The group has ' + toString(num_users) + ' IAM user(s).'
			ELSE 'The group has no IAM users.'
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

func (NonEmptyIAMGroups) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
