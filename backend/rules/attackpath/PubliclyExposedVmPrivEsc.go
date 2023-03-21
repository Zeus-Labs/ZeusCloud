package attackpath

import (
	"fmt"
	graphprocessing "github.com/Zeus-Labs/ZeusCloud/rules/graphprocessing"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedVmPrivEsc struct{}

func (PubliclyExposedVmPrivEsc) UID() string {
	return "attackpath/publicly_exposed_vm_priv_escalation"
}

func (PubliclyExposedVmPrivEsc) Description() string {
	return "Publicly exposed VM instance with potential privilege escalations."
}

func (PubliclyExposedVmPrivEsc) Severity() types.Severity {
	return types.Moderate
}

func (PubliclyExposedVmPrivEsc) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
	}
}

// EC2 is considered publicly exposed if
// - it's directly exposed through security group / IP
// - it's exposed through an ELBv2
// TODO: Add other mechanisms of exposure like ELBv1?
func (PubliclyExposedVmPrivEsc) Execute(tx neo4j.Transaction) ([]types.Result, error) {
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
			(e)-[:STS_ASSUME_ROLE_ALLOW*1..4]->(role:AWSRole)-[privEscalation:PRIVILEGE_ESCALATION]->(escRole)
		WITH a, e, instance_group_ids, public_elbv2_ids, collect(privEscalation.relationship_reason) as relationship_reasons
		WITH a, e, instance_group_ids, public_elbv2_ids, relationship_reasons,
		(e.publicipaddress IS NOT NULL AND size(instance_group_ids) > 0) OR size(public_elbv2_ids) > 0 as publicly_exposed,
		(size(relationship_reasons) > 0) as is_privilege_escalation
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE
			WHEN publicly_exposed AND is_privilege_escalation THEN 'failed'
			ELSE 'passed'
		END as status,
		CASE
			WHEN publicly_exposed THEN (
				'The instance is publicly exposed. ' +
				CASE
					WHEN e.publicipaddress IS NOT NULL THEN 'The instance has a public IP address: ' + e.publicipaddress + '.'
					ELSE 'The instance has no public IP address.'
				END + ' ' +
				CASE
					WHEN size(instance_group_ids) > 0 THEN 'The following security groups attached to the instance allow traffic from 0.0.0.0/0: ' + substring(apoc.text.join(instance_group_ids, ', '), 0, 1000) + '.'
					ELSE 'No security group attached to the instance allows traffic from 0.0.0.0/0.'
				END + ' ' +
				CASE
					WHEN size(public_elbv2_ids) > 0 THEN 'The instance is publicly exposed through these ELBv2 load balancers: ' + substring(apoc.text.join(public_elbv2_ids, ', '), 0, 1000) + '.'
					ELSE 'The instance is not publicly exposed through any ELBv2 load balancers.'
				END
			)
			ELSE 'The instance is neither directly publicly exposed, nor indirectly public exposed through an ELBv2 load balancer.'
		END + ' ' +
		CASE
			WHEN is_privilege_escalation THEN (
				'The instance has risky privilege esclataion in the account because of: ' + relationship_reasons[0] + '.'
			)
			ELSE 'The instance was not detected with a risky privilege escalation in the account.'
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

func (PubliclyExposedVmPrivEsc) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (types.GraphPathResult, error) {
	var params = make(map[string]interface{})
	params["InstanceId"] = resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance{id: $InstanceId})
		OPTIONAL MATCH
			directPublicPath=
			(:IpRange{id: '0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(instance_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP|NETWORK_INTERFACE*..2]-(e)
		WITH e, collect(directPublicPath) as directPublicPaths
		OPTIONAL MATCH
			indirectPublicPath=
			(:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
			(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
			(listener:ELBV2Listener),
			(elbv2)-[:EXPOSE]->(e)
		WHERE listener.port >= perm.fromport AND listener.port <= perm.toport
		WITH e, directPublicPaths, collect(indirectPublicPath) as indirectPublicPaths
		OPTIONAL MATCH
			privilegeEscalationPath=
			(e)-[:STS_ASSUME_ROLE_ALLOW*1..4]->(role:AWSRole)-[privEscalation:PRIVILEGE_ESCALATION]->(escRole)
		WITH e, directPublicPaths, indirectPublicPaths,
		collect(privilegeEscalationPath) as privilegeEscalationPaths
		WITH directPublicPaths + indirectPublicPaths + privilegeEscalationPaths AS paths
		RETURN paths`,
		params)
	if err != nil {
		return types.GraphPathResult{}, err
	}

	graphPathResult, err := graphprocessing.ProcessGraphPathResult(records, "paths")
	if err != nil {
		return types.GraphPathResult{}, err
	}

	return graphPathResult, nil
}

func (PubliclyExposedVmPrivEsc) ProduceDisplayGraph(gp types.GraphPathResult) (types.DisplayGraph, error) {
	return types.DisplayGraph{}, nil
}
