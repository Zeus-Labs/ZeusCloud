package attackpath

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessPrivEsc struct{}

func (PubliclyExposedServerlessPrivEsc) UID() string {
	return "attackpath/publicly_exposed_serverless_priv_escalation"
}

func (PubliclyExposedServerlessPrivEsc) Description() string {
	return "Publicly exposed serverless function with potential privilege escalations."
}

func (PubliclyExposedServerlessPrivEsc) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedServerlessPrivEsc) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (PubliclyExposedServerlessPrivEsc) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(lambda:AWSLambda)
		OPTIONAL MATCH
			(:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
			(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
			(listener:ELBV2Listener),
			(elbv2)-[:EXPOSE]->(lambda)
		WHERE listener.port >= perm.fromport AND listener.port <= perm.toport
		WITH a, lambda, collect(distinct elbv2.id) as public_elbv2_ids
		OPTIONAL MATCH
			(lambda)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole)-[privEscalation:PRIVILEGE_ESCALATION]->(escRole)
		WITH a, lambda, public_elbv2_ids, collect(privEscalation.relationship_reason) as relationship_reasons
		WITH a, lambda, public_elbv2_ids, relationship_reasons,
		size(public_elbv2_ids) > 0 as publicly_exposed,
		(size(relationship_reasons) > 0) as is_privilege_escalation
		RETURN lambda.id as resource_id,
		'AWSLambda' as resource_type,
		a.id as account_id,
		CASE 
			WHEN publicly_exposed AND is_privilege_escalation THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE 
			WHEN publicly_exposed THEN (
				'The function is publicly exposed. ' +
				CASE 
					WHEN size(public_elbv2_ids) > 0 THEN 'The function is publicly exposed through these ELBv2 load balancers: ' + substring(apoc.text.join(public_elbv2_ids, ', '), 0, 1000) + '.'
					ELSE 'The function is not publicly exposed through any ELBv2 load balancers.'
				END
			)
			ELSE 'The function is neither directly publicly exposed, nor indirectly public exposed through an ELBv2 load balancer.'
		END + ' ' +
		CASE 
			WHEN is_privilege_escalation THEN (
				'The function has risky privilege escalation in the account because of: ' + relationship_reasons[0] + '.'
			)
			ELSE 'The function was not detected with a risky privilege escalation in the account.'
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
