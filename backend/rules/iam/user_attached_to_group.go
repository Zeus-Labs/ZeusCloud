package iam

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type UserAttachedToGroup struct{}

func (UserAttachedToGroup) UID() string {
	return "iam/user_attached_to_group"
}

func (UserAttachedToGroup) Description() string {
	return "IAM user should be associated with at least 1 group."
}

func (UserAttachedToGroup) Severity() types.Severity {
	return types.Low
}

func (UserAttachedToGroup) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (UserAttachedToGroup) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:AWSUser)
		OPTIONAL MATCH (g:AWSGroup)<-[:MEMBER_AWS_GROUP]-(u)
		WITH a, u, sum(CASE WHEN g IS NULL THEN 0 ELSE 1 END) as num_groups
		RETURN u.arn as resource_id,
		'AWSUser' as resource_type,
		a.id as account_id,    
		CASE
			WHEN num_groups > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN num_groups > 0 THEN 'The user is associated with ' + toString(num_groups) + ' group(s).'
			ELSE 'The user is associated with no groups.'
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
