package inventory

import (
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecurityGroup struct {
	Id        string `json:"id"`
	AccountId string `json:"account_id"`
	Name      string `json:"name"`
	Vpc       string `json:"vpc"`
	Region    string `json:"region"`
}

func RetrieveSecurityGroups(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(sg:EC2SecurityGroup)
		OPTIONAL MATCH (sg)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-(v:AWSVpc)
		WITH a, sg, collect(v.id) as vpc_ids
		RETURN sg.id as id,
		a.id as account_id,
		sg.name as name,
		CASE WHEN size(vpc_ids) > 0 THEN vpc_ids[0] ELSE "" END as vpc,
		sg.region as region`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedSecurityGroups []interface{}
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
		name, _ := record.Get("name")
		nameStr, ok := name.(string)
		if !ok {
			return nil, fmt.Errorf("name %v should be of type string", nameStr)
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
		retrievedSecurityGroups = append(retrievedSecurityGroups, SecurityGroup{
			Id:        idStr,
			AccountId: accountIDStr,
			Name:      nameStr,
			Vpc:       vpcStr,
			Region:    regionStr,
		})
	}

	return retrievedSecurityGroups, nil
}
