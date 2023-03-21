package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// TODO: Figure out how to test this with CDK.
type PasswordNumbersRequired struct{}

func (PasswordNumbersRequired) UID() string {
	return "iam/password_numbers_required"
}

func (PasswordNumbersRequired) Description() string {
	return "Password policy should require at least one number character."
}

func (PasswordNumbersRequired) Severity() types.Severity {
	return types.Moderate
}

func (PasswordNumbersRequired) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (PasswordNumbersRequired) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(app:AccountPasswordPolicy)
		RETURN app.id as resource_id,
		'AccountPasswordPolicy' as resource_type,
		a.id as account_id,
		CASE
			WHEN app.require_numbers THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN app.require_numbers IS NULL THEN 'The require numbers field has not been set in the account password policy.'
			WHEN app.require_numbers THEN 'The account password policy requires numbers.'
			ELSE 'The account password policy does not require numbers.'
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

func (PasswordNumbersRequired) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}

func (PasswordNumbersRequired) ProduceDisplayGraph(gp types.GraphPathResult) (types.DisplayGraph, error) {
	return types.DisplayGraph{}, nil
}
