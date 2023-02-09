package ec2

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type UnusedEIPAddresses struct{}

func (UnusedEIPAddresses) UID() string {
	return "ec2/unused_eip_addresses"
}

func (UnusedEIPAddresses) Description() string {
	return "Elastic IP addresses should be removed if they are unused."
}

func (UnusedEIPAddresses) Severity() types.Severity {
	return types.Low
}

func (UnusedEIPAddresses) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{}
}

func (UnusedEIPAddresses) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(eip:ElasticIPAddress)
		RETURN eip.id as resource_id,
		'ElasticIPAddress' as resource_type,
		a.id as account_id,
		CASE
			WHEN eip.association_id is NULL THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN eip.association_id is NULL THEN 'The EIP is unused.'
			WHEN eip.instance_id is NOT NULL and eip.network_interface_id is NOT NULL THEN 'The EIP is associated with instance ' + eip.instance_id + ' and network interface ' + eip.network_interface_id + '.'
			ELSE 'The EIP is used.'
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
