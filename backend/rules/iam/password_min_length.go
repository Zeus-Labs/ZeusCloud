package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// TODO: Figure out how to test this with CDK.
type PasswordMinLength struct{}

func (PasswordMinLength) UID() string {
	return "iam/password_min_length"
}

func (PasswordMinLength) Description() string {
	return "Password policy should require a minimum length of at least 14."
}

func (PasswordMinLength) Severity() types.Severity {
	return types.Moderate
}

func (PasswordMinLength) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (PasswordMinLength) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(app:AccountPasswordPolicy)
		RETURN app.id as resource_id,
		'AccountPasswordPolicy' as resource_type,
		a.id as account_id,   
		CASE 
			WHEN app.minimum_password_length >= 14 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN app.minimum_password_length IS NULL THEN 'The minimum password length field has not been set in the account password policy.'
			ELSE 'The minimum password length is ' + toString(app.minimum_password_length) + ' in the account password policy.'
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

func (PasswordMinLength) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
