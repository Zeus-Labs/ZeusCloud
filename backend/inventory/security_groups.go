package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type SecurityGroup struct {
	Id        *string `json:"id"`
	AccountId *string `json:"account_id"`
	Name      *string `json:"name"`
	Vpc       *string `json:"vpc"`
	Region    *string `json:"region"`
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

		var parsingErrs error
		idStr, err := util.ParseAsOptionalString(record, "id")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		nameStr, err := util.ParseAsOptionalString(record, "name")
		multierror.Append(parsingErrs, err)
		vpcStr, err := util.ParseAsOptionalString(record, "vpc")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
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
