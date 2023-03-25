package cloudwatch

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type OrganizationChanges struct{}

func (OrganizationChanges) UID() string {
	return "cloudwatch/organization_changes"
}

func (OrganizationChanges) Description() string {
	return "Log metric filter and alarm should exist for AWS Organization changes"
}

func (OrganizationChanges) Severity() types.Severity {
	return types.Low
}

func (OrganizationChanges) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.InsufficientMonitoring,
	}
}

func (OrganizationChanges) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})
		OPTIONAL MATCH (a)-[:RESOURCE]->(t:CloudTrail)-[:DELIVERS_TO]->(lg:CloudWatchLogGroup)-[:HAS_METRIC_FILTER]->(mf:CloudWatchMetricFilter)
		WHERE t.is_multi_region_trail AND
		t.is_logging AND
		mf.filter_pattern =~ '.*\s*\$\.eventSource\s*=\s*"?organizations.amazonaws.com"?.+\$\.eventName\s*=\s*"?AcceptHandshake"?.+\$\.eventName\s*=\s*"?AttachPolicy"?.+\$\.eventName\s*=\s*"?CreateAccount"?.+\$\.eventName\s*=\s*"?CreateOrganizationalUnit"?.+\$\.eventName\s*=\s*"?CreatePolicy"?.+\$\.eventName\s*=\s*"?DeclineHandshake"?.+\$\.eventName\s*=\s*"?DeleteOrganization"?.+\$\.eventName\s*=\s*"?DeleteOrganizationalUnit"?.+\$\.eventName\s*=\s*"?DeletePolicy"?.+\$\.eventName\s*=\s*"?DetachPolicy"?.+\$\.eventName\s*=\s*"?DisablePolicyType"?.+\$\.eventName\s*=\s*"?EnablePolicyType"?.+\$\.eventName\s*=\s*"?InviteAccountToOrganization"?.+\$\.eventName\s*=\s*"?LeaveOrganization"?.+\$\.eventName\s*=\s*"?MoveAccount"?.+\$\.eventName\s*=\s*"?RemoveAccountFromOrganization"?.+\$\.eventName\s*=\s*"?UpdatePolicy"?.+\$\.eventName\s*=\s*"?UpdateOrganizationalUnit"?.*'
		OPTIONAL MATCH (al:CloudWatchAlarm)
		WHERE al.metric_name IS NOT NULL
		AND mf.metric_transformation_name = al.metric_name
		WITH a,
		COLLECT(CASE WHEN t IS NOT NULL AND lg IS NOT NULL AND mf IS NOT NULL AND al IS NOT NULL THEN t ELSE NULL END) as valid_ts,
		COLLECT(CASE WHEN t IS NOT NULL AND lg IS NOT NULL AND mf IS NOT NULL AND al IS NOT NULL THEN lg ELSE NULL END) as valid_lgs,
		COLLECT(CASE WHEN t IS NOT NULL AND lg IS NOT NULL AND mf IS NOT NULL AND al IS NOT NULL THEN mf ELSE NULL END) as valid_mfs,
		COLLECT(CASE WHEN t IS NOT NULL AND lg IS NOT NULL AND mf IS NOT NULL AND al IS NOT NULL THEN al ELSE NULL END) as valid_als,
		SUM(CASE WHEN t IS NOT NULL AND lg IS NOT NULL AND mf IS NOT NULL AND al IS NOT NULL THEN 1 ELSE 0 END) as num_valid
		RETURN a.id as resource_id,
		'AWSAccount' as resource_type,
		a.id as account_id,
		CASE WHEN 
			num_valid = 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE WHEN 
			num_valid = 0 THEN 'There is no log metric filter and alarm monitoring an active, multi-region CloudTrail trail for AWS Organization changes.'
			ELSE 'The metric filter ' + valid_mfs[0].filter_name + ' and alarm ' + valid_als[0].arn + ' monitor AWS Organization change events.'
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

func (OrganizationChanges) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	return nil, nil
}
