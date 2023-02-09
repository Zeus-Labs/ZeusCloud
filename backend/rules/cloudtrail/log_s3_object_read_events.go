package cloudtrail

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type LogS3ObjectReadEvents struct{}

func (LogS3ObjectReadEvents) UID() string {
	return "cloudtrail/log_s3_object_read_events"
}

func (LogS3ObjectReadEvents) Description() string {
	return "S3 bucket object-level read events logging should be enabled in Cloudtrail."
}

func (LogS3ObjectReadEvents) Severity() types.Severity {
	return types.High
}

func (LogS3ObjectReadEvents) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientLogging,
	}
}

func (LogS3ObjectReadEvents) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		OPTIONAL MATCH (a)<-[:MONITORS]-(:CloudTrail)<-[:APPLIES_TO]-(es:CloudTrailEventSelector)
		WHERE es.data_resources IS NOT NULL
		AND es.read_write_type in ['All', 'ReadOnly']
		WITH a, s, es,
		CASE 
		  WHEN es IS NULL or es.data_resources IS NULL THEN NULL
		  ELSE apoc.convert.getJsonProperty(es, 'data_resources', '$[?(@.Type == "AWS::S3::Object")].Values[*]') 
		END as bucket_selection_lst
		UNWIND (
		  CASE 
			WHEN apoc.meta.type(bucket_selection_lst) = "LIST" 
			AND size(bucket_selection_lst) > 0
			THEN bucket_selection_lst
			ELSE [null] 
		  END
		) as bucket_selection
		WITH a, s,
		SUM(CASE 
		  WHEN bucket_selection = 'arn:aws:s3:::' OR bucket_selection = 'arn:aws:s3' OR bucket_selection =~ 'arn:aws:s3:::' + s.id + '/.*'
		  THEN 1
		  ELSE 0
		END) as bucket_selection_matches
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id,
		CASE
			WHEN bucket_selection_matches > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN bucket_selection_matches > 0 THEN 'The bucket has some object-level read events logging enabled through CloudTrail event selectors.'
			ELSE 'The bucket has no object-level read events logging enabled through CloudTrail event selectors.'
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
