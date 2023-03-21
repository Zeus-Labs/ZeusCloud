package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type KmsKey struct {
	Id           *string    `json:"id"`
	AccountId    *string    `json:"account_id"`
	CreationDate *time.Time `json:"creation_date"`
	Enabled      *bool      `json:"enabled"`
	Region       *string    `json:"region"`
	Origin       *string    `json:"region"`
}

func RetrieveKmsKeys(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(k:KMSKey)
		RETURN k.id as id,
		a.id as account_id,
		k.creationdate as creation_date,
		k.enabled as enabled,
		k.region as region,
		k.origin as origin`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedKmsKeys []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		idStr, err := util.ParseAsOptionalString(record, "id")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		creationDate, err := util.ParseAsOptionalTime(record, "creation_date")
		multierror.Append(parsingErrs, err)
		enabledBool, err := util.ParseAsOptionalBool(record, "enabled")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		originStr, err := util.ParseAsOptionalString(record, "origin")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedKmsKeys = append(retrievedKmsKeys, KmsKey{
			Id:           idStr,
			AccountId:    accountIDStr,
			CreationDate: creationDate,
			Enabled:      enabledBool,
			Region:       regionStr,
			Origin:       originStr,
		})
	}

	return retrievedKmsKeys, nil
}
