package cloudtrail

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type LogFileValidationEnabled struct{}

func (LogFileValidationEnabled) UID() string {
	return "cloudtrail/log_file_validation_enabled"
}

func (LogFileValidationEnabled) Description() string {
	return "Cloudtrail trails should have log file validation enabled."
}

func (LogFileValidationEnabled) Severity() types.Severity {
	return types.Moderate
}

func (LogFileValidationEnabled) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientMonitoring,
	}
}

func (LogFileValidationEnabled) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(t:CloudTrail)
		RETURN t.id as resource_id,
		'CloudTrail' as resource_type,
		a.id as account_id,
		CASE 
			WHEN t.log_file_validation_enabled THEN 'passed' 
			ELSE 'failed' 
		END as status,
		CASE 
			WHEN t.log_file_validation_enabled THEN 'The trail has log file validation enabled.' 
			ELSE 'The trail does not have log file validation enabled.' 
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

func (LogFileValidationEnabled) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	return nil, nil
}
