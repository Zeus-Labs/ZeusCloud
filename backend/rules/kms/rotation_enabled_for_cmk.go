package kms

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type RotationEnabledForCMK struct{}

func (RotationEnabledForCMK) UID() string {
	return "kms/rotation_enabled_for_cmk"
}

func (RotationEnabledForCMK) Description() string {
	return "Customer created KMS CMK's should have rotation enabled."
}

func (RotationEnabledForCMK) Severity() types.Severity {
	return types.Moderate
}

func (RotationEnabledForCMK) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (RotationEnabledForCMK) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(k:KMSKey)
		WHERE k.origin = 'AWS_KMS'
		AND k.keystate = 'Enabled'
		AND k.keymanager = 'CUSTOMER'
		RETURN k.id as resource_id,
		'KMSKey' as resource_type,
		a.id as account_id,
		CASE
			WHEN k.key_rotation_enabled THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN k.key_rotation_enabled THEN 'The key has rotation enabled.'
			ELSE 'The key does not have rotation enabled.'
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

func (RotationEnabledForCMK) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
