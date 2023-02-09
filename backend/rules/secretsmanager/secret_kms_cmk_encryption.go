package secretsmanager

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecretKmsCmkEncryption struct{}

func (SecretKmsCmkEncryption) UID() string {
	return "secretsmanager/secret_kms_cmk_encryption"
}

func (SecretKmsCmkEncryption) Description() string {
	return "Secrets manager secrets should at least be encrypted with KMS customer managed keys."
}

func (SecretKmsCmkEncryption) Severity() types.Severity {
	return types.High
}

func (SecretKmsCmkEncryption) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (SecretKmsCmkEncryption) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:SecretsManagerSecret)
		RETURN s.id as resource_id,
		'SecretsManagerSecret' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN s.kms_key_id is NULL THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN s.kms_key_id is NULL THEN 'The secret is not encrypted with KMS.'
			ELSE 'The secret is encrypted with KMS key ' + s.kms_key_id + '.'
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
