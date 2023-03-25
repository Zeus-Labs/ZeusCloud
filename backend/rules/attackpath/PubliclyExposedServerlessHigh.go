package attackpath

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessHigh struct{}

func (PubliclyExposedServerlessHigh) UID() string {
	return "attackpath/publicly_exposed_serverless_high_permissions"
}

func (PubliclyExposedServerlessHigh) Description() string {
	return "Publicly exposed serverless function with high permissions."
}

func (PubliclyExposedServerlessHigh) Severity() types.Severity {
	return types.High
}

func (PubliclyExposedServerlessHigh) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
	}
}

func (PubliclyExposedServerlessHigh) Execute(tx neo4j.Transaction) ([]types.Result, error) {
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
			(lambda)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_high: True})
		WITH a, lambda, public_elbv2_ids, collect(role.arn) as high_roles, collect(role.high_reason) as high_reasons
		WITH a, lambda, public_elbv2_ids, high_roles, high_reasons,
		size(public_elbv2_ids) > 0 as publicly_exposed,
		(size(high_roles) > 0) as is_high
		RETURN lambda.id as resource_id,
		'AWSLambda' as resource_type,
		a.id as account_id,
		CASE 
			WHEN publicly_exposed AND is_high THEN 'failed'
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
			WHEN is_high THEN (
				'The function has high privileges in the account because of: ' + high_reasons[0] + '.'
			)
			ELSE 'The function was not detected with high privileges in the account.'
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

func (PubliclyExposedServerlessHigh) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	params := map[string]interface{}{
		"InstanceId": resourceId,
	}
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(lambda:AWSLambda{id: $InstanceId})
		OPTIONAL MATCH
			(:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
			(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
			(listener:ELBV2Listener),
			(lambda)<-[:EXPOSE]-(elbv2)
		WHERE listener.port >= perm.fromport AND listener.port <= perm.toport
		OPTIONAL MATCH
			indirectPath=(lambda)<-[:EXPOSE]-(elbv2)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(elbv2_group)
			<-[:MEMBER_OF_EC2_SECURITY_GROUP]-(perm)<-[:MEMBER_OF_IP_RULE]-(iprange)
		WITH a, lambda, collect(indirectPath) as indirectPaths
		OPTIONAL MATCH
			highRolePath=
			(lambda)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_high: True})
		WITH lambda, indirectPaths, collect(highRolePath) as highRolePaths
		WITH indirectPaths + highRolePaths AS paths
		RETURN paths`,
		params,
	)
	if err != nil {
		return nil, err
	}
	return records, nil
}
