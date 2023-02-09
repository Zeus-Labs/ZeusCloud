package cloudtrail

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type BucketAccessLogging struct{}

func (BucketAccessLogging) UID() string {
	return "cloudtrail/bucket_access_logging"
}

func (BucketAccessLogging) Description() string {
	return "Cloudtrail trails' S3 logging buckets should have access logging enabled."
}

func (BucketAccessLogging) Severity() types.Severity {
	return types.Critical
}

func (BucketAccessLogging) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientLogging,
	}
}

func (BucketAccessLogging) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(t:CloudTrail)-[:DELIVERS_TO]->(s:S3Bucket)
		RETURN t.id as resource_id,
		'CloudTrail' as resource_type,
		a.id as account_id,
		CASE 
			WHEN s.logging_target_bucket IS NULL THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN s.logging_target_bucket IS NULL THEN 'The trail\'s S3 logging bucket ' + t.s3_bucket_name + ' has access logging disabled.'
			ELSE 'The trail\'s S3 logging bucket ' + t.s3_bucket_name + ' has access logging enabled. Access logs can be found in bucket ' + s.logging_target_bucket + '.'
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
