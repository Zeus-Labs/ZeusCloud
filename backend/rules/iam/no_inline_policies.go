package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type NoInlinePolicies struct{}

func (NoInlinePolicies) UID() string {
	return "iam/no_inline_policies"
}

func (NoInlinePolicies) Description() string {
	return "IAM groups, users, and roles should not have any inline policies."
}

func (NoInlinePolicies) Severity() types.Severity {
	return types.Low
}

func (NoInlinePolicies) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (NoInlinePolicies) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(principal:AWSPrincipal)
		WHERE NOT principal.arn CONTAINS 'service-role/'
		AND (principal.type IS NULL OR principal.type <> 'Service')
		OPTIONAL MATCH (principal)-[:POLICY]->(policy:AWSPolicy)
		WHERE policy.type = 'inline'
		WITH a, principal, SUM(CASE WHEN policy IS NULL THEN 0 ELSE 1 END) as num_inline_policies
		RETURN principal.arn as resource_id,
		'AWSPrincipal' as resource_type,
		a.id as account_id,  
		CASE 
			WHEN num_inline_policies > 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_inline_policies > 0 THEN 'The Principal has ' + toString(num_inline_policies) + ' inline policies.' 
			ELSE 'The Principal has no inline policies.'
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

func (NoInlinePolicies) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
