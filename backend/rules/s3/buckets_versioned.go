package s3

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type BucketsVersioned struct{}

func (BucketsVersioned) UID() string {
	return "s3/buckets_versioned"
}

func (BucketsVersioned) Description() string {
	return "S3 buckets should have versioning enabled to help recover from data loss."
}

func (BucketsVersioned) Severity() types.Severity {
	return types.Moderate
}

func (BucketsVersioned) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorBackup,
	}
}

func (BucketsVersioned) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id,
		CASE
			WHEN s.versioning_status = 'Enabled' THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN s.versioning_status = 'Enabled' THEN 'Versioning is enabled for the bucket.'
			ELSE 'Versioning is not enabled for the bucket.'
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

func (BucketsVersioned) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}

func (BucketsVersioned) ProduceDisplayGraph(gp types.GraphPathResult) (types.DisplayGraph, error) {
	return types.DisplayGraph{}, nil
}
