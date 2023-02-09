package rds

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type InstanceAtRestEncrypted struct{}

func (InstanceAtRestEncrypted) UID() string {
	return "rds/instance_at_rest_encrypted"
}

func (InstanceAtRestEncrypted) Description() string {
	return "RDS instances should have at rest encryption enabled."
}

func (InstanceAtRestEncrypted) Severity() types.Severity {
	return types.Critical
}

func (InstanceAtRestEncrypted) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (InstanceAtRestEncrypted) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(r:RDSInstance)
		RETURN r.arn as resource_id,
		'RDSInstance' as resource_type,
		a.id as account_id,    
		CASE
			WHEN r.storage_encrypted THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN r.storage_encrypted THEN 'Instance is at rest encrypted.'
			ELSE 'Instance is not at rest encrypted.'
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
