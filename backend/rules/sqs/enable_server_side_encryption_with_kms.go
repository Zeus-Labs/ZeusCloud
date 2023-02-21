package sqs

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type EnableServerSideEncryptionWithKMS struct{}

func (EnableServerSideEncryptionWithKMS) UID() string {
	return "sqs/enable_server_side_encryption_with_kms"
}

func (EnableServerSideEncryptionWithKMS) Description() string {
	return "SQS queues should have at rest encryption enabled with AWS KMS."
}

func (EnableServerSideEncryptionWithKMS) Severity() types.Severity {
	return types.High
}

func (EnableServerSideEncryptionWithKMS) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
		types.DataAccess,
	}
}

func (EnableServerSideEncryptionWithKMS) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(q:SQSQueue)
		RETURN q.id as resource_id,
		'SQSQueue' as resource_type,
		a.id as account_id, 
		CASE
			WHEN q.kms_master_key_id IS NULL OR q.kms_master_key_id = '' THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN q.kms_master_key_id IS NULL OR q.kms_master_key_id = '' THEN 'At rest encryption is not enabled with KMS.'
			ELSE 'At rest encryption is enabled with KMS key ' + q.kms_master_key_id + '.'
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
