package vpc

import (
	"fmt"

	"github.com/IronLeap/IronCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type ExcessiveSecurityGroups struct{}

func (ExcessiveSecurityGroups) UID() string {
	return "vpc/excessive_security_groups"
}

func (ExcessiveSecurityGroups) Description() string {
	return "The number of security groups within a region should be be minimized for easier management."
}

func (ExcessiveSecurityGroups) Severity() types.Severity {
	return types.Moderate
}

func (ExcessiveSecurityGroups) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{}
}

func (ExcessiveSecurityGroups) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(sg:EC2SecurityGroup)
		WITH a, sg.region as region, count(*) as sgNum
		RETURN a.id + '/' + region as resource_id,
		'AWSRegion' as resource_type,
		a.id as account_id, 
		CASE
			WHEN sgNum >= 35 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN sgNum >= 35 THEN 'There are too many security groups in the region: ' + sgNum + '.'
			ELSE 'There are ' + sgNum + ' security groups in the region.'
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
