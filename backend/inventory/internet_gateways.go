package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type InternetGateway struct {
	Arn       *string `json:"arn"`
	AccountId *string `json:"account_id"`
	VPC       *string `json:"vpc"`
	Region    *string `json:"region"`
}

func RetrieveInternetGateways(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(ig:AWSInternetGateway)
		OPTIONAL MATCH (ig)-[:ATTACHED_TO]->(v:AWSVpc)
		WITH a, ig, collect(v.id) as vpc_ids
		RETURN ig.arn as arn,
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
		arnStr, err := util.ParseAsOptionalString(record, "arn")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		vpcStr, err := util.ParseAsOptionalString(record, "vpc")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedInternetGateways = append(retrievedInternetGateways, InternetGateway{
			Arn:       arnStr,
			AccountId: accountIDStr,
			VPC:       vpcStr,
			Region:    regionStr,
		})
	}

	return retrievedInternetGateways, nil
}
