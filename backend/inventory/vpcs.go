package inventory

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type Vpc struct {
	Id               string   `json:"id"`
	AccountId        string   `json:"account_id"`
	PrimaryCidrBlock string   `json:"primary_cidr_block"`
	State            string   `json:"state"`
	IsDefault        bool     `json:"is_default"`
	Region           string   `json:"region"`
	SubnetIds        []string `json:"subnet_ids"`
}

func RetrieveVpcs(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(v:AWSVpc)
		OPTIONAL MATCH (sn:EC2Subnet)-[:MEMBER_OF_AWS_VPC]->(v)
		WITH a, v, collect(sn.id) as subnet_ids
		RETURN v.id as id,
		a.id as account_id,
		e.primary_cidr_block as primary_cidr_block,
		e.state as state,
		v.is_default as is_default,
		e.region as region,
		subnet_ids`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedVpcs []interface{}
	for records.Next() {
		record := records.Record()
		id, _ := record.Get("id")
		idStr, ok := id.(string)
		if !ok {
			return nil, fmt.Errorf("id %v should be of type string", idStr)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountIDStr)
		}
		primaryCidrBlock, _ := record.Get("primary_cidr_block")
		primaryCidrBlockStr, ok := primaryCidrBlock.(string)
		if !ok {
			return nil, fmt.Errorf("primary_cidr_block %v should be of type string", primaryCidrBlockStr)
		}
		state, _ := record.Get("state")
		stateStr, ok := state.(string)
		if !ok {
			return nil, fmt.Errorf("state %v should be of type string", stateStr)
		}
		isDefault, _ := record.Get("is_default")
		isDefaultBool, ok := isDefault.(bool)
		if !ok {
			return nil, fmt.Errorf("is_default %v should be of type bool", isDefaultBool)
		}
		region, _ := record.Get("region")
		regionStr, ok := region.(string)
		if !ok {
			return nil, fmt.Errorf("region %v should be of type string", regionStr)
		}
		subnetIdsLst, err := util.ParseAsStringList(record, "subnet_ids")
		if err != nil {
			return nil, err
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
