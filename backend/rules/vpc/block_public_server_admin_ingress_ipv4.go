package vpc

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type BlockPublicServerAdminIngressIpv4 struct{}

func (BlockPublicServerAdminIngressIpv4) UID() string {
	return "vpc/block_public_server_admin_ingress_ipv4"
}

func (BlockPublicServerAdminIngressIpv4) Description() string {
	return "Security groups should not allow ingress to 0.0.0.0/0 on ports 22 and 3389."
}

func (BlockPublicServerAdminIngressIpv4) Severity() types.Severity {
	return types.Critical
}

func (BlockPublicServerAdminIngressIpv4) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (BlockPublicServerAdminIngressIpv4) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(sg:EC2SecurityGroup)
		OPTIONAL MATCH (range:IpRange)-[:MEMBER_OF_IP_RULE]->(rule:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(sg)
		WITH a, sg, rule, range
		RETURN sg.id as resource_id,
		'EC2SecurityGroup' as resource_type,
		a.id as account_id, 
		CASE WHEN range.range = '0.0.0.0/0' AND
		(
			(rule.fromport is NULL OR rule.toport is NULL) OR
			(rule.fromport <= 22 AND rule.toport >= 22) OR
			(rule.fromport <= 3389 AND rule.toport >= 3389)
		) THEN 'failed' ELSE 'passed' END as status,
		CASE 
			WHEN range.range = '0.0.0.0/0' AND (rule.fromport is NULL OR rule.toport is NULL) THEN 'The security group allows public ingress on many ports.'
			WHEN range.range = '0.0.0.0/0' AND (rule.fromport <= 22 AND rule.toport >= 22) THEN 'The security group allows public ingress on port 22.'
			WHEN range.range = '0.0.0.0/0' AND (rule.fromport <= 3389 AND rule.toport >= 3389) THEN 'The security group allows public ingress on port 3389.'
			ELSE 'The security group does not allow public ingress on port 22 or 3389.'
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

func (BlockPublicServerAdminIngressIpv4) ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	params := map[string]interface{}{
		"resourceId": resourceId,
	}

	records, err := tx.Run(
		`MATCH sg = (s:EC2SecurityGroup{id: $resourceId})
		Optional MATCH vpcPath = (s)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(:AWSVpc)
		with s,sg,collect(vpcPath) as vpcPaths
		Optional MATCH ec2Path = (:EC2Instance)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(s)
		with s,sg,vpcPaths,collect(ec2Path) as ec2Paths
		Optional MATCH rdsPath = (:RDSInstance)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(s)
		with s,sg,vpcPaths,ec2Paths,collect(rdsPath) as rdsPaths
		Optional MATCH lbPath = (:LoadBalancerV2)-[:MEMBER_OF_EC2_SECURITY_GROUP]->(s)
		with s,sg,vpcPaths,ec2Paths,rdsPaths,collect(lbPath) as lbPaths
		with vpcPaths+ec2Paths+rdsPaths+lbPaths+sg as paths
		return paths;`,
		params)

	if err != nil {
		return nil, err
	}

	return records, nil
}
