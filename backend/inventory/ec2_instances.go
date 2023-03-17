package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type Ec2Instance struct {
	InstancdId      string    `json:"instance_id"`
	AccountId       string    `json:"account_id"`
	LaunchTime      time.Time `json:"launch_time"`
	State           string    `json:"state"`
	PubliclyExposed string    `json:"publicly_exposed"` // TODO: Standardize this across cartography, attack paths, asset inventory, and graph viz
	IamRoles        []string  `json:"iam_roles"`
	KeyPairs        []string  `json:"key_pairs"`
	Vpc             string    `json:"vpc"`
	Region          string    `json:"region"`
}

func RetrieveEc2Instances(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance)
		OPTIONAL MATCH (e)-[:STS_ASSUME_ROLE_ALLOW]->(r:AWSRole)
		WITH a, e, collect(r.arn) as role_arns
		OPTIONAL MATCH (e)-[:PART_OF_SUBNET]->(:EC2Subnet)-[:MEMBER_OF_AWS_VPC]->(v:AWSVpc)
		WITH a, e, role_arns, collect(v.id) as vpc_ids
		OPTIONAL MATCH (e)<-[:SSH_LOGIN_TO]-(k:EC2KeyPair)
		WITH a, e, role_arns, vpc_ids, collect(k.arn) as key_arns
		RETURN e.id as instance_id,
		a.id as account_id,
		e.launchtime as launch_time,
		e.state as state,
		CASE WHEN e.exposed_internet THEN "Yes" ELSE "No" END as publicly_exposed,
		role_arns as iam_roles,
		key_arns as key_pairs,
		CASE WHEN size(vpc_ids) > 0 THEN vpc_ids[0] ELSE "" END as vpc,
		e.region as region`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedEc2Instances []interface{}
	for records.Next() {
		record := records.Record()
		instanceId, _ := record.Get("instance_id")
		instanceIdStr, ok := instanceId.(string)
		if !ok {
			return nil, fmt.Errorf("instance_id %v should be of type string", instanceIdStr)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountIDStr)
		}
		launchTime, err := util.ParseAsTime(record, "launch_time")
		if err != nil {
			return nil, err
		}
		state, _ := record.Get("state")
		stateStr, ok := state.(string)
		if !ok {
			return nil, fmt.Errorf("state %v should be of type string", stateStr)
		}
		publiclyExposed, _ := record.Get("publicly_exposed")
		publiclyExposedStr, ok := publiclyExposed.(string)
		if !ok {
			return nil, fmt.Errorf("publicly_exposed %v should be of type string", publiclyExposedStr)
		}
		iamRolesLst, err := util.ParseAsStringList(record, "iam_roles")
		if err != nil {
			return nil, err
		}
		keyPairsLst, err := util.ParseAsStringList(record, "key_pairs")
		if err != nil {
			return nil, err
		}
		vpc, _ := record.Get("vpc")
		vpcStr, ok := vpc.(string)
		if !ok {
			return nil, fmt.Errorf("vpc %v should be of type string", vpcStr)
		}
		region, _ := record.Get("region")
		regionStr, ok := region.(string)
		if !ok {
			return nil, fmt.Errorf("region %v should be of type string", regionStr)
		}
		retrievedEc2Instances = append(retrievedEc2Instances, Ec2Instance{
			InstancdId:      instanceIdStr,
			AccountId:       accountIDStr,
			LaunchTime:      launchTime,
			State:           stateStr,
			PubliclyExposed: publiclyExposedStr,
			IamRoles:        iamRolesLst,
			KeyPairs:        keyPairsLst,
			Vpc:             vpcStr,
			Region:          regionStr,
		})
	}

	return retrievedEc2Instances, nil
}
