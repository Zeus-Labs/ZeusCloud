package attackpath

import (
	"fmt"
	graphprocessing "github.com/Zeus-Labs/ZeusCloud/rules/graphprocessing"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PrivateVmAdmin struct{}

func (PrivateVmAdmin) UID() string {
	return "attackpath/private_vm_admin_permissions"
}

func (PrivateVmAdmin) Description() string {
	return "Private VM instance with effective admin permissions."
}

func (PrivateVmAdmin) Severity() types.Severity {
	return types.High
}

func (PrivateVmAdmin) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.IamMisconfiguration,
	}
}

func (PrivateVmAdmin) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		OPTIONAL MATCH
			(:IpRange{id: '0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(instance_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP|NETWORK_INTERFACE*..2]-(e)
		WITH a, e, collect(distinct instance_group.id) as instance_group_ids
		OPTIONAL MATCH
			(:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
			(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
			(listener:ELBV2Listener),
			(elbv2)-[:EXPOSE]->(e)
		WHERE listener.port >= perm.fromport AND listener.port <= perm.toport
		WITH a, e, instance_group_ids, collect(distinct elbv2.id) as public_elbv2_ids
		OPTIONAL MATCH
			(e)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_admin: True})
		WITH a, e, instance_group_ids, public_elbv2_ids, collect(role.arn) as admin_roles, collect(role.admin_reason) as admin_reasons
		WITH a, e, instance_group_ids, public_elbv2_ids, admin_roles, admin_reasons,
		(e.publicipaddress IS NULL OR size(instance_group_ids) = 0) AND size(public_elbv2_ids) = 0 as private,
		(size(admin_roles) > 0) as is_admin
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE
			WHEN private AND is_admin THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN is_admin THEN (
				'The instance is effectively an admin in the account because of: ' + admin_reasons[0] + '.'
			)
			ELSE 'The instance was not detected as effectively an admin in the account.'
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

func (PrivateVmAdmin) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	var params = make(map[string]interface{})
	params["InstanceId"] = resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance{id: $InstanceId})
		OPTIONAL MATCH
			directPath=
			(:IpRange)-[:MEMBER_OF_IP_RULE]->
			(:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(instance_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP|NETWORK_INTERFACE*..2]-(e)
		WITH e, collect(directPath) as directPaths
		OPTIONAL MATCH
			adminRolePath=
			(e)-[:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole{is_admin: True})
		WITH e, directPaths, collect(adminRolePath) as adminRolePaths
		WITH directPaths + adminRolePaths AS paths
		RETURN paths`,
		params)
	if err != nil {
		return types.GraphPathResult{}, err
	}

	processedGraphResult, err := graphprocessing.ProcessGraphPathResult(records, "paths")
	if err != nil {
		return types.GraphPathResult{}, err
	}

	// Prune graph to display.
	var prunedGraph []types.Path
	for _, path := range processedGraphResult.PathResult {
		processedBoolOne, processedPathOne := graphprocessing.ProcessIpRangeRuleNetworkInterfaceEc2Path(path)
		processedBoolTwo, processedPathTwo := graphprocessing.ProcessIpRangeRulePermissionsEc2Path(path)
		if processedBoolOne {
			prunedGraph = append(prunedGraph, processedPathOne)
		} else if processedBoolTwo {
			prunedGraph = append(prunedGraph, processedPathTwo)
		} else {
			prunedGraph = append(prunedGraph, path)
		}
	}

	for _, path := range prunedGraph {
		fmt.Printf("Path Nodes %+v \n", path.Nodes)
		fmt.Printf("Path Relationships %+v \n", path.Relationships)
	}

	var finalGraphResult types.GraphPathResult
	finalGraphResult.PathResult = prunedGraph
	return finalGraphResult, nil
}
