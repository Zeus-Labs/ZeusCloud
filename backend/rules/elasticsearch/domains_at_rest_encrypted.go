package elasticsearch

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type DomainsAtRestEncrypted struct{}

func (DomainsAtRestEncrypted) UID() string {
	return "elasticsearch/domains_at_rest_encrypted"
}

func (DomainsAtRestEncrypted) Description() string {
	return "Elastic search domains should be encrypted at rest."
}

func (DomainsAtRestEncrypted) Severity() types.Severity {
	return types.High
}

func (DomainsAtRestEncrypted) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (DomainsAtRestEncrypted) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(d:ESDomain)
		RETURN d.id as resource_id,
		'ESDomain' as resource_type,
		a.id as account_id,
		CASE 
			WHEN d.encryption_at_rest_options_enabled THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE 
			WHEN d.encryption_at_rest_options_enabled THEN 'The ES domain has encryption at rest enabled.'
			ELSE 'The ES domain does not have encryption at rest enabled.'
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

func (DomainsAtRestEncrypted) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) ([]types.GraphResult, error) {
	return nil, nil
}
