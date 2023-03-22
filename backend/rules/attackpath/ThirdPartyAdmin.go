package attackpath

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type ThirdPartyAdmin struct{}

func (ThirdPartyAdmin) UID() string {
	return "attackpath/third_party_admin_permissions"
}

func (ThirdPartyAdmin) Description() string {
	return "A 3rd party identity has admin permissions in the account."
}

func (ThirdPartyAdmin) Severity() types.Severity {
	return types.Critical
}

func (ThirdPartyAdmin) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (ThirdPartyAdmin) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->
		(role:AWSRole)-[r:TRUSTS_AWS_PRINCIPAL]->
		(externalPrincipal:AWSPrincipal)<-[:RESOURCE]-(eAccount:AWSAccount)
		WHERE externalPrincipal.arn ENDS WITH 'root' AND
		(NOT eAccount.inscope OR NOT EXISTS(eAccount.inscope))
		WITH a, eAccount, collect(CASE WHEN role.is_admin THEN role.arn ELSE NULL END) as adminRoleArnList
		RETURN eAccount.id as resource_id,
		'AWSAccount' as resource_type,
		a.id as account_id,
		CASE 
			WHEN size(adminRoleArnList) > 0 THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN size(adminRoleArnList) > 0 THEN (
				'The external account ' + eAccount.id + ' can assume admin privileged role(s): ' + 
				substring(apoc.text.join(adminRoleArnList, ', '), 0, 1000) + ' in account ' + a.id + '.'
			)
			ELSE 'The external account ' + eAccount.id + ' has access to account ' + a.id +
			' but was not detected to have admin privileges.'
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

func (ThirdPartyAdmin) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
