package ec2

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type EBSOptimizedEnabled struct{}

func (EBSOptimizedEnabled) UID() string {
	return "ec2/ebs_optimized_enabled"
}

func (EBSOptimizedEnabled) Description() string {
	return "EBS optimization should be enabled for those EC2 instances that allow it."
}

func (EBSOptimizedEnabled) Severity() types.Severity {
	return types.Low
}

func (EBSOptimizedEnabled) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{}
}

func (EBSOptimizedEnabled) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE 
			WHEN e.ebsoptimized THEN 'passed' 
			ELSE 'failed'
		END as status,
		CASE 
			WHEN e.ebsoptimized THEN 'EBS optimization is enabled.' 
			ELSE 'EBS optimization is not enabled.' 
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

func (EBSOptimizedEnabled) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
