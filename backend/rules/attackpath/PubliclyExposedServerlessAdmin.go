package attackpath

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/processgraph"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessAdmin struct{}

func (PubliclyExposedServerlessAdmin) UID() string {
	return "attackpath/publicly_exposed_serverless_admin_permissions"
}

func (PubliclyExposedServerlessAdmin) Description() string {
	return "Publicly exposed serverless function with effective admin permissions."
}

func (PubliclyExposedServerlessAdmin) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedServerlessAdmin) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
	}
}

func (PubliclyExposedServerlessAdmin) Execute(tx neo4j.Transaction) ([]types.Result, error) {
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
			(lambda)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_admin: True})
		WITH a, lambda, public_elbv2_ids, collect(role.arn) as admin_roles, collect(role.admin_reason) as admin_reasons
		WITH a, lambda, public_elbv2_ids, admin_roles, admin_reasons,
		size(public_elbv2_ids) > 0 as publicly_exposed,
		(size(admin_roles) > 0) as is_admin
		RETURN lambda.id as resource_id,
		'AWSLambda' as resource_type,
		a.id as account_id,
		CASE 
			WHEN publicly_exposed AND is_admin THEN 'failed'
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
			WHEN is_admin THEN (
				'The function is effectively an admin in the account because of: ' + admin_reasons[0] + '.'
			)
			ELSE 'The function was not detected as effectively an admin in the account.'
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

func (PubliclyExposedServerlessAdmin) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
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
			adminRolePath=
			(lambda)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_admin: True})
		WITH lambda, indirectPaths, collect(adminRolePath) as adminRolePaths
		WITH indirectPaths + adminRolePaths AS paths
		RETURN paths`,
		params,
	)
	if err != nil {
		return types.GraphPathResult{}, err
	}

	// Parsed out graph from the query.
	graph, err := processgraph.ProcessGraphPathResult(records, "paths")
	if err != nil {
		return types.GraphPathResult{}, err
	}

	// Check that all the paths start with the correct node.
	pathCheckBool, pathsFailing := processgraph.GraphStartNodeCheck(graph, resourceId)
	if !pathCheckBool {
		return types.GraphPathResult{}, fmt.Errorf("Error %v Paths Failing %+v", err.Error(), pathsFailing)
	}

	graphPathResult := processgraph.CompressPaths(graph)
	return graphPathResult, nil
}
