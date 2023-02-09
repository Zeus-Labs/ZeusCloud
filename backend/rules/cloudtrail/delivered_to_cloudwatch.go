package cloudtrail

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type DeliveredToCloudwatch struct{}

func (DeliveredToCloudwatch) UID() string {
	return "cloudtrail/delivered_to_cloudwatch"
}

func (DeliveredToCloudwatch) Description() string {
	return "Cloudtrail trails should be delivered to Cloudwatch"
}

func (DeliveredToCloudwatch) Severity() types.Severity {
	return types.High
}

func (DeliveredToCloudwatch) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientMonitoring,
	}
}

func (DeliveredToCloudwatch) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(t:CloudTrail)
		WITH a, t, datetime().epochSeconds as currentTime, 24 * 60 * 60 as oneDay
		RETURN t.id as resource_id,
		'CloudTrail' as resource_type,
		a.id as account_id,
		CASE 
			WHEN t.cloud_watch_logs_log_group_arn IS NULL THEN 'failed'
			WHEN t.latest_cloud_watch_logs_delivery_time IS NULL THEN 'failed'
			WHEN currentTime - t.latest_cloud_watch_logs_delivery_time > oneDay THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN t.cloud_watch_logs_log_group_arn IS NULL THEN 'The trail is not integrated with Cloudwatch log groups.'
			WHEN t.latest_cloud_watch_logs_delivery_time IS NULL THEN 'The trail is integrated with Cloudwatch log group ' + t.cloud_watch_logs_log_group_arn + ', but has not delivered logs.'
			WHEN currentTime - t.latest_cloud_watch_logs_delivery_time > oneDay THEN 'The trail is integrated with Cloudwatch log group ' + t.cloud_watch_logs_log_group_arn + ', but has not delivered logs in the past day.' 
			ELSE 'The trail is integrated with Cloudwatch log group ' + t.cloud_watch_logs_log_group_arn + ', and it has delivered logs in the past day.'
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
