package s3

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type BlockPublicAccessConfig struct{}

func (BlockPublicAccessConfig) UID() string {
	return "s3/block_public_access_config"
}

func (BlockPublicAccessConfig) Description() string {
	return "Buckets should be configured with block public access settings."
}

func (BlockPublicAccessConfig) Severity() types.Severity {
	return types.High
}

func (BlockPublicAccessConfig) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.DataAccess,
		types.IamMisconfiguration,
	}
}

func (BlockPublicAccessConfig) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	// TODO: Take into account the account-level public access blocks
	// TODO: Add s.block_public_policy. Right now there's a typo in cartography
	// where it is missing.
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id,
		CASE 
			WHEN s.ignore_public_acls AND s.block_public_acls AND s.restrict_public_buckets THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN s.ignore_public_acls THEN 'All public ACLs on this bucket are ignored.'
			ELSE 'Public ACLs on the bucket are not set to be ignored.'
		END + ' ' +
		CASE 
			WHEN s.block_public_acls THEN 'Creation/modification of ACLs on the bucket that enable public access will be blocked.'
			ELSE 'Creation/modification of ACLs on the bucket that enable public access will not be blocked.'
		END + ' ' +
		CASE 
			WHEN s.restrict_public_buckets THEN 'All bucket policies enabling public access to this bucket are ignored.'
			ELSE 'Bucket policies enabling public access to this bucket are not set to be ignored.'
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

func (BlockPublicAccessConfig) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	return nil, nil
}
