package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type Ec2Instance struct {
	InstancdId      *string    `json:"instance_id"`
	AccountId       *string    `json:"account_id"`
	LaunchTime      *time.Time `json:"launch_time"`
	State           *string    `json:"state"`
	PubliclyExposed *string    `json:"publicly_exposed"` // TODO: Standardize this across cartography, attack paths, asset inventory, and graph viz
	IamRoles        []string   `json:"iam_roles"`
	KeyPairs        []string   `json:"key_pairs"`
	Vpc             *string    `json:"vpc"`
	Region          *string    `json:"region"`
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

		var parsingErrs error
		instanceIdStr, err := util.ParseAsOptionalString(record, "instance_id")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		launchTime, err := util.ParseAsOptionalTime(record, "launch_time")
		multierror.Append(parsingErrs, err)
		stateStr, err := util.ParseAsOptionalString(record, "state")
		multierror.Append(parsingErrs, err)
		publiclyExposedStr, err := util.ParseAsOptionalString(record, "publicly_exposed")
		multierror.Append(parsingErrs, err)
		iamRolesLst, err := util.ParseAsOptionalStringList(record, "iam_roles")
		multierror.Append(parsingErrs, err)
		keyPairsLst, err := util.ParseAsOptionalStringList(record, "key_pairs")
		multierror.Append(parsingErrs, err)
		vpcStr, err := util.ParseAsOptionalString(record, "vpc")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
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
