package secretsmanager

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecretRotationEnabled struct{}

func (SecretRotationEnabled) UID() string {
	return "secretsmanager/secret_rotation_enabled"
}

func (SecretRotationEnabled) Description() string {
	return "Automatic rotation should be enabled for secret manager secrets."
}

func (SecretRotationEnabled) Severity() types.Severity {
	return types.Moderate
}

func (SecretRotationEnabled) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (SecretRotationEnabled) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:SecretsManagerSecret)
		RETURN s.id as resource_id,
		'SecretsManagerSecret' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN s.rotation_enabled THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN s.rotation_enabled THEN 'Automatic rotation is turned on for the secret.'
			ELSE 'Automatic rotation is not turned on for the secret.'
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
