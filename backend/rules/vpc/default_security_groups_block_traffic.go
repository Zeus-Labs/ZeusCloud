package vpc

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type DefaultSecurityGroupsBlockTraffic struct{}

func (DefaultSecurityGroupsBlockTraffic) UID() string {
	return "vpc/default_security_groups_block_traffic"
}

func (DefaultSecurityGroupsBlockTraffic) Description() string {
	return "Default security groups should block all inbound and outbound traffic."
}

func (DefaultSecurityGroupsBlockTraffic) Severity() types.Severity {
	return types.High
}

func (DefaultSecurityGroupsBlockTraffic) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (DefaultSecurityGroupsBlockTraffic) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(sg:EC2SecurityGroup)
		WHERE sg.name = 'default'
		WITH a, sg, count((:IpRule)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(sg)) as num_rules
		RETURN sg.id as resource_id,
		'EC2SecurityGroup' as resource_type,
		a.id as account_id, 
		CASE 
			WHEN num_rules > 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN num_rules > 0 THEN 'The security group has ' + toString(num_rules) + ' IP rules, so it doesn\'t block all traffic.'
			ELSE 'The security group blocks all inbound / outbound traffic.'
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

func (DefaultSecurityGroupsBlockTraffic) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
