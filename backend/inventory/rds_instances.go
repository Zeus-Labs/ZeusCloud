package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type RdsIntance struct {
	Arn                string    `json:"arn"`
	AccountId          string    `json:"account_id"`
	UserIdentifier     string    `json:"user_identifier"`
	AvailabilityZone   string    `json:"availability_zone"`
	EndpointAddress    string    `json:"endpoint_address"`
	EndpointPort       int       `json:"endpoint_port"`
	Engine             string    `json:"engine"`
	CreateTime         time.Time `json:"create_time"`
	PubliclyAccessible bool      `json:"publicly_accessible"`
	StorageEncrypted   bool      `json:"storage_encrypted"`
}

func RetrieveRdsInstances(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(r:RDSInstance)
		RETURN r.arn as arn,
		a.id as account_id,
		r.db_instance_identifier as user_identifier,
		r.availability_zone as availability_zone,
		r.endpoint_address as endpoint_address,
		r.endpoint_port as endpoint_port,
		r.engine as engine,
		r.instance_create_time as create_time,
		r.publicly_accessible as publicly_accessible,
		r.storage_encrypted as storage_encrypted`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedRdsInstances []interface{}
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
		userIdentifier, _ := record.Get("user_identifier")
		userIdentifierStr, ok := userIdentifier.(string)
		if !ok {
			return nil, fmt.Errorf("user_identifier %v should be of type string", userIdentifierStr)
		}
		availabilityZone, _ := record.Get("availability_zone")
		availabilityZoneStr, ok := availabilityZone.(string)
		if !ok {
			return nil, fmt.Errorf("availability_zone %v should be of type string", availabilityZoneStr)
		}
		endpointAddress, _ := record.Get("endpoint_address")
		endpointAddressStr, ok := endpointAddress.(string)
		if !ok {
			return nil, fmt.Errorf("endpoint_address %v should be of type string", endpointAddressStr)
		}
		endpointPort, _ := record.Get("endpoint_port")
		endpointPortInt, ok := endpointPort.(int)
		if !ok {
			return nil, fmt.Errorf("endpoint_port %v should be of type int", endpointPortInt)
		}
		engine, _ := record.Get("engine")
		engineStr, ok := engine.(string)
		if !ok {
			return nil, fmt.Errorf("engine %v should be of type string", engineStr)
		}
		createTime, err := util.ParseAsTime(record, "create_time")
		if err != nil {
			return nil, err
		}
		publiclyAccessible, _ := record.Get("publicly_accessible")
		publiclyAccessibleBool, ok := publiclyAccessible.(bool)
		if !ok {
			return nil, fmt.Errorf("publicly_accessible %v should be of type bool", publiclyAccessibleBool)
		}
		storageEncrypted, _ := record.Get("storage_encrypted")
		storageEncryptedBool, ok := storageEncrypted.(bool)
		if !ok {
			return nil, fmt.Errorf("storage_encrypted %v should be of type bool", storageEncryptedBool)
		}
		retrievedRdsInstances = append(retrievedRdsInstances, RdsIntance{
			Arn:                arnStr,
			AccountId:          accountIDStr,
			UserIdentifier:     userIdentifierStr,
			AvailabilityZone:   availabilityZoneStr,
			EndpointAddress:    endpointAddressStr,
			EndpointPort:       endpointPortInt,
			Engine:             engineStr,
			CreateTime:         createTime,
			PubliclyAccessible: publiclyAccessibleBool,
			StorageEncrypted:   storageEncryptedBool,
		})
	}

	return retrievedRdsInstances, nil
}
