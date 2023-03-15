package s3

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type RestrictPubliclyReadable struct{}

func (RestrictPubliclyReadable) UID() string {
	return "s3/restrict_publicly_readable"
}

func (RestrictPubliclyReadable) Description() string {
	return "S3 buckets should not be publicly readable."
}

func (RestrictPubliclyReadable) Severity() types.Severity {
	return types.Critical
}

func (RestrictPubliclyReadable) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.DataAccess,
		types.IamMisconfiguration,
	}
}

func (RestrictPubliclyReadable) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	// TODO: Enumerate anonymous_actions that go along with anonymous_actions that make
	// a bucket policy trigger a failed condition.
	// TODO: Take into account the account-level public access blocks
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		OPTIONAL MATCH (sa:S3Acl)-[:APPLIES_TO]->(s)
		WHERE (
			(
				sa.uri = 'http://acs.amazonaws.com/groups/global/AllUsers' OR
				sa.uri = 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
			) AND
			sa.permission IN ['FULL_CONTROL', 'READ', 'READ_ACP']
		)
		WITH a, s, SUM(CASE WHEN sa is not NULL THEN 1 ELSE 0 END) as num_public_grants
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_public_grants > 0 THEN 'failed'
			WHEN (s.restrict_public_buckets is NULL OR NOT s.restrict_public_buckets) AND s.anonymous_access THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN (s.ignore_public_acls is NULL OR NOT s.ignore_public_acls) AND num_public_grants > 0 THEN 'The bucket has public read permissions through ACLs.'
			ELSE 'The bucket does not have public read permissions through ACLs.'
		END + ' ' +
		CASE 
			WHEN (s.restrict_public_buckets is NULL OR NOT s.restrict_public_buckets) AND s.anonymous_access THEN 'The bucket has public read permissions through its bucket policy.'
			ELSE 'The bucket does not have public read permissions through its bucket policy.'
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

func (RestrictPubliclyReadable) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
