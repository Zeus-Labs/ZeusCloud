package elbv2

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// TODO: Figure out how to test this with CDK.
type AvoidInsecureCiphers struct{}

func (AvoidInsecureCiphers) UID() string {
	return "elbv2/avoid_insecure_ciphers"
}

func (AvoidInsecureCiphers) Description() string {
	return "ELBv2 listeners should avoid using policies with insecure ciphers."
}

func (AvoidInsecureCiphers) Severity() types.Severity {
	return types.Critical
}

func (AvoidInsecureCiphers) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PoorEncryption,
	}
}

func (AvoidInsecureCiphers) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(lbv2:LoadBalancerV2)-[:ELBV2_LISTENER]->(listener:ELBV2Listener)
		WHERE listener.protocol IN ['HTTPS', 'TLS'] AND listener.ssl_policy IS NOT NULL
		WITH a, lbv2,
		COLLECT(DISTINCT
			CASE
				WHEN
					listener.ssl_policy IN
					[
						'ELBSecurityPolicy-TLS-1-2-2017-01',
						'ELBSecurityPolicy-TLS-1-2-Ext-2018-06',
						'ELBSecurityPolicy-FS-1-2-2019-08',
						'ELBSecurityPolicy-FS-1-2-Res-2019-08',
						'ELBSecurityPolicy-FS-1-2-Res-2020-10',
						'ELBSecurityPolicy-TLS13-1-2-2021-06',
						'ELBSecurityPolicy-TLS13-1-3-2021-06',
						'ELBSecurityPolicy-TLS13-1-2-Res-2021-06',
						'ELBSecurityPolicy-TLS13-1-2-Ext1-2021-06',
						'ELBSecurityPolicy-TLS13-1-2-Ext2-2021-06'
					]
				THEN listener.ssl_policy
				ELSE NULL
			END
		) as insecure_policies
		RETURN lbv2.id as resource_id,
		'LoadBalancerV2' as resource_type,
		a.id as account_id,
		CASE
			WHEN size(insecure_policies) = 0 THEN 'passed'
			ELSE 'failed'
		END as status,
		CASE
			WHEN size(insecure_policies) = 0 THEN 'The ELB has no policies with insecure SSL ciphers.'
			ELSE 'The ELB has policies with insecure SSL ciphers: ' + substring(apoc.text.join(insecure_policies, ', '), 0, 1000) + '.'
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

func (AvoidInsecureCiphers) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	return types.GraphPathResult{}, nil
}
