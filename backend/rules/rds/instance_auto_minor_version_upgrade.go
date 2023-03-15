package rds

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type InstanceAutoMinorVersionUpgrade struct{}

func (InstanceAutoMinorVersionUpgrade) UID() string {
	return "rds/instance_auto_minor_version_upgrade"
}

func (InstanceAutoMinorVersionUpgrade) Description() string {
	return "RDS instances should have minor version upgrades automatically applied during maintenance."
}

func (InstanceAutoMinorVersionUpgrade) Severity() types.Severity {
	return types.Moderate
}

func (InstanceAutoMinorVersionUpgrade) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.Patching,
	}
}

func (InstanceAutoMinorVersionUpgrade) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(r:RDSInstance)
		RETURN r.arn as resource_id,
		'RDSInstance' as resource_type,
		a.id as account_id,
		CASE
			WHEN r.auto_minor_version_upgrade THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN r.auto_minor_version_upgrade THEN 'Instance has minor version upgrades automatically applied during maintenance.'
			ELSE 'Instance does not have minor version upgrades automatically applied during maintenance.'
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

func (InstanceAutoMinorVersionUpgrade) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
