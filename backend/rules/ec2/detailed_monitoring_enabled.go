package ec2

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type DetailedMonitoringEnabled struct{}

func (DetailedMonitoringEnabled) UID() string {
	return "ec2/detailed_monitoring_enabled"
}

func (DetailedMonitoringEnabled) Description() string {
	return "Detailed monitoring should be enabled for EC2 instances."
}

func (DetailedMonitoringEnabled) Severity() types.Severity {
	return types.Low
}

func (DetailedMonitoringEnabled) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientMonitoring,
	}
}

func (DetailedMonitoringEnabled) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE 
			WHEN e.monitoringstate = 'enabled' THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN e.monitoringstate = 'enabled' THEN 'Detailed monitoring is enabled for the instance.'
			ELSE 'Detailed monitoring is not enabled for the instance.'
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
