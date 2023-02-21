package vpc

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type UnusedSecurityGroups struct{}

func (UnusedSecurityGroups) UID() string {
	return "vpc/unused_security_groups"
}

func (UnusedSecurityGroups) Description() string {
	return "Non-default security groups that are unused should be removed"
}

func (UnusedSecurityGroups) Severity() types.Severity {
	return types.Moderate
}

func (UnusedSecurityGroups) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.UnusedResource,
	}
}

func (UnusedSecurityGroups) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(sg:EC2SecurityGroup)
		WHERE sg.name <> 'default'
		OPTIONAL MATCH (ni:NetworkInterface)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(sg)
		WITH a, sg, count(ni) as num_ni
		RETURN sg.id as resource_id,
		'EC2SecurityGroup' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN num_ni = 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_ni = 0 THEN 'The security group is unused.'
			ELSE 'The security group is being used. It is applied to ' + toString(num_ni) + ' network interfaces.'
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
