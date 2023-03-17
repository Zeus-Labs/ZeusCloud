package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type KmsKey struct {
	Id           string    `json:"id"`
	AccountId    string    `json:"account_id"`
	CreationDate time.Time `json:"creation_date"`
	Enabled      bool      `json:"enabled"`
	Region       string    `json:"region"`
	Origin       string    `json:"region"`
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
		creationDate, err := util.ParseAsTime(record, "creation_date")
		if err != nil {
			return nil, err
		}
		enabled, _ := record.Get("enabled")
		enabledBool, ok := enabled.(bool)
		if !ok {
			return nil, fmt.Errorf("enabled %v should be of type bool", enabledBool)
		}
		region, _ := record.Get("region")
		regionStr, ok := region.(string)
		if !ok {
			return nil, fmt.Errorf("region %v should be of type string", regionStr)
		}
		origin, _ := record.Get("origin")
		originStr, ok := origin.(string)
		if !ok {
			return nil, fmt.Errorf("origin %v should be of type string", originStr)
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
