package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type UserActiveAccessKeys struct{}

func (UserActiveAccessKeys) UID() string {
	return "iam/user_active_access_keys"
}

func (UserActiveAccessKeys) Description() string {
	return "IAM users should each only have at most one active access key."
}

func (UserActiveAccessKeys) Severity() types.Severity {
	return types.Low
}

func (UserActiveAccessKeys) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (UserActiveAccessKeys) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:AWSUser)
		OPTIONAL MATCH (u)-[:AWS_ACCESS_KEY]->(k:AccountAccessKey)
		WHERE k.status = 'Active'
		WITH a, u, collect(CASE WHEN k is NULL THEN NULL ELSE k.accesskeyid END) as active_key_ids
		RETURN u.arn as resource_id,
		'AWSUser' as resource_type,
		a.id as account_id,
		CASE
			WHEN size(active_key_ids) > 1 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN size(active_key_ids) > 0 THEN 'The user has ' + toString(size(active_key_ids)) + ' active access key(s): ' + substring(apoc.text.join(active_key_ids, ', '), 0 ,1000) + '.'
			ELSE 'The user has no active access keys.'
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

func (UserActiveAccessKeys) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}

func (UserActiveAccessKeys) ProduceDisplayGraph(gp types.GraphPathResult) (types.DisplayGraph, error) {
	return types.DisplayGraph{}, nil
}
