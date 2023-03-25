package cloudtrail

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type TrailsAtRestEncrypted struct{}

func (TrailsAtRestEncrypted) UID() string {
	return "cloudtrail/trails_at_rest_encrypted"
}

func (TrailsAtRestEncrypted) Description() string {
	return "Cloudtrail trails should have at rest encryption enabled"
}

func (TrailsAtRestEncrypted) Severity() types.Severity {
	return types.High
}

func (TrailsAtRestEncrypted) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (TrailsAtRestEncrypted) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(t:CloudTrail)
		RETURN t.id as resource_id,
		'CloudTrail' as resource_type,
		a.id as account_id,
		CASE 
			WHEN t.kms_key_id IS NULL THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN t.kms_key_id IS NULL THEN 'The trail logs do not have at-rest encryption enabled.'
			ELSE 'The trail logs have at-rest encryption enabled with KMS key ' + t.kms_key_id + '.'
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

func (TrailsAtRestEncrypted) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	return nil, nil
}
