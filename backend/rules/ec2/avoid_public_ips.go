package ec2

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type AvoidPublicIPs struct{}

func (AvoidPublicIPs) UID() string {
	return "ec2/avoid_public_ips"
}

func (AvoidPublicIPs) Description() string {
	return "EC2 instances shouldn't have public IPs to prevent public exposure."
}

func (AvoidPublicIPs) Severity() types.Severity {
	return types.High
}

func (AvoidPublicIPs) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (AvoidPublicIPs) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE 
			WHEN e.publicipaddress IS NULL THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN e.publicipaddress IS NULL THEN 'The EC2 instance does not have a public IP address attached.'
			ELSE 'The EC2 instance has public IP address ' + e.publicipaddress + ' attached.'
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

func (AvoidPublicIPs) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
