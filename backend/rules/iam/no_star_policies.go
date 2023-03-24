package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type NoStarPolicies struct{}

func (NoStarPolicies) UID() string {
	return "iam/no_star_policies"
}

func (NoStarPolicies) Description() string {
	return "Full '*' administrative privileges shouldn't be allowed through IAM policies."
}

func (NoStarPolicies) Severity() types.Severity {
	return types.High
}

func (NoStarPolicies) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (NoStarPolicies) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPolicy)
		OPTIONAL MATCH (p)-[:STATEMENT]->(s:AWSPolicyStatement)
		WHERE s.effect = 'Allow' AND
		'*' IN s.resource AND
		('*' IN s.action OR '*:*' IN s.action)
		WITH a, p, SUM(CASE WHEN s IS NULL THEN 0 ELSE 1 END) as num_star_found
		RETURN p.id as resource_id,
		'AWSPolicy' as resource_type,
		a.id as account_id,   
		CASE 
			WHEN num_star_found > 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_star_found > 0 THEN 'The policy has ' + toString(num_star_found) + ' statements allowing * action on * resource.'
			ELSE 'The policy has no statements allowing * action on * resource.'
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

func (NoStarPolicies) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	return nil, nil
}
