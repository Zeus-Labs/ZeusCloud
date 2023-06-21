package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type InternetGateway struct {
	NodeId       *int64  `json:"node_id"`
	Arn          *string `json:"arn"`
	AccountId    *string `json:"account_id"`
	VPC          *string `json:"vpc"`
	Region       *string `json:"region"`
	IsCrownJewel *bool   `json:"is_crown_jewel"`
}

func RetrieveInternetGateways(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(ig:AWSInternetGateway)
		OPTIONAL MATCH (ig)-[:ATTACHED_TO]->(v:AWSVpc)
		WITH a, ig, collect(v.id) as vpc_ids
		RETURN ID(ig) as node_id,
		ig.arn as arn,
		ig.is_crown_jewel as is_crown_jewel,
		a.id as account_id,
		CASE WHEN size(vpc_ids) > 0 THEN vpc_ids[0] ELSE "" END as vpc,
		ig.region as region`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedInternetGateways []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		NodeIdInt, err := util.ParseAsOptionalInt64(record, "node_id")
		multierror.Append(parsingErrs, err)
		arnStr, err := util.ParseAsOptionalString(record, "arn")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		vpcStr, err := util.ParseAsOptionalString(record, "vpc")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		isCrownJewelBool, err := util.ParseAsOptionalBool(record, "is_crown_jewel")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedInternetGateways = append(retrievedInternetGateways, InternetGateway{
			NodeId:       NodeIdInt,
			Arn:          arnStr,
			AccountId:    accountIDStr,
			VPC:          vpcStr,
			Region:       regionStr,
			IsCrownJewel: isCrownJewelBool,
		})
	}

	return retrievedInternetGateways, nil
}
