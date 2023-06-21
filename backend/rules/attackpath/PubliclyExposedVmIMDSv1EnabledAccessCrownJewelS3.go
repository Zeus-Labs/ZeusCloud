package attackpath

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3 struct{}

func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) UID() string {
	return "attackpath/publicly_exposed_vm_imdsv1_enabled_has_access_to_crown_jewel_s3_bucket"
}

func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) Description() string {
	return "Publicly exposed VM instance with IMDSv1 enabled has access to crown jewel S3 bucket."
}

func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
		types.DataAccess,
	}
}

// EC2 is considered publicly exposed if
// - it's directly exposed through security group / IP
// - it's exposed through an ELBv2
// TODO: Add other mechanisms of exposure like ELBv1?
// TODO: Complete this attackpath, doubt: each S3 bucket will be associated with multiple ec2s and
// each ec2 will either be have security group and elbv2 or not, when we run query there comes out
// to be multiple records for the same S3 bucket
func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) Execute(tx neo4j.Transaction) ([]types.Result, error) {
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
			(e)-[:HAS_POLICY_ACCESS]->(s:S3Bucket {is_crown_jewel:True})
		WITH a, s, e, instance_group_ids, public_elbv2_ids, collect(distinct s.id) as crown_jewel_bucket_ids
		WITH a, s, e, instance_group_ids, public_elbv2_ids, crown_jewel_bucket_ids,
		(e.publicipaddress IS NOT NULL AND size(instance_group_ids) > 0) OR size(public_elbv2_ids) > 0 as publicly_exposed,
		size(crown_jewel_bucket_ids) > 0 as has_s3_access
		RETURN e.id as resource_id,
		'EC2Instance' as resource_type,
		a.id as account_id,
		CASE 
			WHEN publicly_exposed AND e.isimdsv1enabled AND has_s3_access THEN 'failed'
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
		END + '\n' +
		CASE 
			WHEN e.isimdsv1enabled THEN (
				'IMDSv1 is enabled for the instance.'
			)
			ELSE 'IMDSv1 is disabled for the instance.'
		END + '\n' +
		CASE
			WHEN has_s3_access THEN (
				'The instance has access to the following crown jewel S3 buckets: ' + substring(apoc.text.join(crown_jewel_bucket_ids, ', '), 0, 1000) + '.'
			)
			ELSE 'The instance does not have access to any crown jewel S3 buckets.'
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

func (PubliclyExposedVmIMDSv1EnabledAccessCrownJewelS3) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	params := map[string]interface{}{
		"InstanceId": resourceId,
	}
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance{id: $InstanceId})
		OPTIONAL MATCH
			directPublicPath=
			(:IpRange{id: '0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(instance_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP|NETWORK_INTERFACE*..2]-(e)
		WITH a, e, collect(directPublicPath) as directPublicPaths
		OPTIONAL MATCH
			(:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
			(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
			(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
			(listener:ELBV2Listener),
			(e)<-[:EXPOSE]-(elbv2)
		WHERE listener.port >= perm.fromport AND listener.port <= perm.toport
		OPTIONAL MATCH
			indirectPath=(iprange)-[:MEMBER_OF_IP_RULE]->(perm)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
			(elbv2_group)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-(elbv2)-[:EXPOSE]->(e)
		WITH a, e, directPublicPaths, collect(indirectPath) as indirectPaths
		OPTIONAL MATCH
			crownJewelS3AccessPath=
			(e)-[:HAS_POLICY_ACCESS]->(s:S3Bucket {is_crown_jewel:True})
		WITH a, e, directPublicPaths, indirectPaths,
		collect(crownJewelS3AccessPath) as crownJewelS3AccessPaths
		WITH directPublicPaths + indirectPaths + crownJewelS3AccessPaths AS paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}

	return records, nil
}
