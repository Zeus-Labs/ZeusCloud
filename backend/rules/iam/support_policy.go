package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SupportPolicy struct{}

func (SupportPolicy) UID() string {
	return "iam/support_policy"
}

func (SupportPolicy) Description() string {
	return "An IAM user, group, or role has specific permissions to coordinate AWS support."
}

func (SupportPolicy) Severity() types.Severity {
	return types.Low
}

func (SupportPolicy) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (SupportPolicy) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})
		OPTIONAL MATCH (a)-[:RESOURCE]->(principal:AWSPrincipal)-[:POLICY]->(policy:AWSPolicy)
		WHERE policy.name = 'AWSSupportAccess'
		WITH a, collect(CASE WHEN principal IS NULL THEN NULL ELSE principal.name END) as principal_names
		RETURN a.id as resource_id,
		'AWSAccount' as resource_type,
		a.id as account_id,
		CASE
			WHEN size(principal_names) > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN size(principal_names) > 0 THEN 'The IAM principal(s) ' + substring(apoc.text.join(principal_names, ', '), 0, 1000) + ' have the AWSSupportAccess policy.'
			ELSE 'The account has no IAM principal with the AWSSupportAccess policy.'
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

func (SupportPolicy) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
