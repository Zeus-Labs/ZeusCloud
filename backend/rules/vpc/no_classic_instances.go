package vpc

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// Not supported for new accounts, so no proper test
type NoClassicInstances struct{}

func (NoClassicInstances) UID() string {
	return "vpc/no_classic_instances"
}

func (NoClassicInstances) Description() string {
	return "EC2 Classic should not be used and should be replaced by VPC."
}

func (NoClassicInstances) Severity() types.Severity {
	return types.Low
}

func (NoClassicInstances) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{}
}

func (NoClassicInstances) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		WHERE e.state = 'running'
		WITH a, e, count((e)-[:NETWORK_INTERFACE]->(:NetworkInterface)) as num
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE
			WHEN num > 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN num > 0 THEN 'EC2 Classic is not being used.'
			ELSE 'EC2 Classic is being used.'
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

func (NoClassicInstances) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
