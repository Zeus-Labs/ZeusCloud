package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type Vpc struct {
	Id               *string  `json:"id"`
	AccountId        *string  `json:"account_id"`
	PrimaryCidrBlock *string  `json:"primary_cidr_block"`
	State            *string  `json:"state"`
	IsDefault        *bool    `json:"is_default"`
	Region           *string  `json:"region"`
	SubnetIds        []string `json:"subnet_ids"`
}

func RetrieveVpcs(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(v:AWSVpc)
		OPTIONAL MATCH (sn:EC2Subnet)-[:MEMBER_OF_AWS_VPC]->(v)
		WITH a, v, collect(sn.id) as subnet_ids
		RETURN v.id as id,
		a.id as account_id,
		v.primary_cidr_block as primary_cidr_block,
		v.state as state,
		v.is_default as is_default,
		v.region as region,
		subnet_ids`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedVpcs []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		idStr, err := util.ParseAsOptionalString(record, "id")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		primaryCidrBlockStr, err := util.ParseAsOptionalString(record, "primary_cidr_block")
		multierror.Append(parsingErrs, err)
		stateStr, err := util.ParseAsOptionalString(record, "state")
		multierror.Append(parsingErrs, err)
		isDefaultBool, err := util.ParseAsOptionalBool(record, "is_default")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		subnetIdsLst, err := util.ParseAsOptionalStringList(record, "subnet_ids")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedVpcs = append(retrievedVpcs, Vpc{
			Id:               idStr,
			AccountId:        accountIDStr,
			PrimaryCidrBlock: primaryCidrBlockStr,
			State:            stateStr,
			IsDefault:        isDefaultBool,
			Region:           regionStr,
			SubnetIds:        subnetIdsLst,
		})
	}

	return retrievedVpcs, nil
}
