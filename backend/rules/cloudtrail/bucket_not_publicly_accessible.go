package cloudtrail

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type BucketNotPubliclyAccessible struct{}

func (BucketNotPubliclyAccessible) UID() string {
	return "cloudtrail/bucket_not_publicly_accessible"
}

func (BucketNotPubliclyAccessible) Description() string {
	return "S3 buckets with Cloudtrail logs should not be publicly accessible"
}

func (BucketNotPubliclyAccessible) Severity() types.Severity {
	return types.Critical
}

func (BucketNotPubliclyAccessible) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.DataAccess,
	}
}

func (BucketNotPubliclyAccessible) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	// TODO: Take into account the account-level public access blocks
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(:CloudTrail)-[:DELIVERS_TO]->(s:S3Bucket)
		OPTIONAL MATCH (sa:S3Acl)-[:APPLIES_TO]->(s)
		WHERE sa.uri = 'http://acs.amazonaws.com/groups/global/AllUsers' OR
		sa.uri = 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
		WITH
			a,
			s,
			SUM(CASE WHEN sa is not NULL AND sa.uri = 'http://acs.amazonaws.com/groups/global/AllUsers' THEN 1 ELSE 0 END) as num_all_grants,
			SUM(CASE WHEN sa is not NULL AND sa.uri = 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers' THEN 1 ELSE 0 END) as num_auth_grants
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id,
		CASE 
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_all_grants > 0 THEN 'failed'
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_auth_grants > 0 THEN 'failed'
			WHEN (s.restrict_public_buckets is NULL OR NOT s.restrict_public_buckets) AND s.anonymous_access THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_all_grants > 0 THEN 'The S3 bucket grants AllUsers access in its ACL.'
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_auth_grants > 0 THEN 'The S3 bucket grants AuthenticatedUsers access in its ACL.'
			WHEN (s.restrict_public_buckets is NULL OR NOT s.restrict_public_buckets) AND s.anonymous_access THEN 'The S3 bucket has a policy granting public access.'
			ELSE 'The S3 bucket does not grant public access through its ACL or policy.'
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

func (BucketNotPubliclyAccessible) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
