package s3

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type EnableServerSideEncryption struct{}

func (EnableServerSideEncryption) UID() string {
	return "s3/enable_server_side_encryption"
}

func (EnableServerSideEncryption) Description() string {
	return "S3 buckets should have at-rest server side encryption enabled by default."
}

func (EnableServerSideEncryption) Severity() types.Severity {
	return types.High
}

func (EnableServerSideEncryption) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
		types.DataAccess,
	}
}

func (EnableServerSideEncryption) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	// TODO: The policy check is a bit leaky. Ideally, there is a null condition to check, and there
	// are other combinations of conditions that would suffice. Consider using policyuniverse?
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		OPTIONAL MATCH (s)-[:POLICY_STATEMENT]->(p:S3PolicyStatement)
		WITH a, s, p,
		CASE WHEN
			p is not NULL THEN apoc.convert.getJsonProperty(p, 'principal', '$')
			ELSE NULL
		END as principal,
		CASE WHEN
			p is not NULL THEN apoc.convert.getJsonProperty(p, 'condition', '$')
			ELSE NULL
		END as condition
		WITH a, s,
		SUM(CASE WHEN
			p is not NULL AND
			p.effect = 'Deny' AND
			(
				p.action = 's3:PutObject' OR
				(apoc.meta.type(p.action) = 'String[]' AND 's3:PutObject' IN p.action)
			) AND
			(
				principal = '*' OR
				(
					apoc.meta.type(principal) = 'MAP' AND
					(
						principal.AWS = '*' OR
						(
							apoc.meta.type(principal.AWS) = 'LIST' AND '*' IN principal.AWS
						)
					)
				)
			) AND
			(
				apoc.meta.type(condition) = 'MAP' AND
				apoc.meta.type(condition.StringNotEquals) = 'MAP' AND
				condition.StringNotEquals['s3:x-amz-server-side-encryption'] IN ['aws:kms', 'AES256']
			)
		THEN 1 ELSE 0 END) as num_deny_statements
		RETURN s.id as resource_id,
		'S3Bucket' as resource_type,
		a.id as account_id,
		CASE
			WHEN s.default_encryption OR num_deny_statements > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN s.default_encryption THEN 'Default encryption is enabled for the bucket.'
			ELSE 'Default encryption is not enabled for the bucket.'
		END + ' ' +
		CASE
			WHEN num_deny_statements > 0 THEN 'A bucket policy enforces encryption.'
			ELSE 'A bucket policy does not enforce encryption.'
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

func (EnableServerSideEncryption) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
