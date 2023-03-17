package inventory

import (
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type InternetGateway struct {
	Arn       string `json:"arn"`
	AccountId string `json:"account_id"`
	VPC       string `json:"vpc"`
	Region    string `json:"region"`
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
		arn, _ := record.Get("arn")
		arnStr, ok := arn.(string)
		if !ok {
			return nil, fmt.Errorf("arn %v should be of type string", arnStr)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountIDStr)
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
		retrievedInternetGateways = append(retrievedInternetGateways, InternetGateway{
			Arn:       arnStr,
			AccountId: accountIDStr,
			VPC:       vpcStr,
			Region:    regionStr,
		})
	}

	return retrievedInternetGateways, nil
}
