package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type RdsIntance struct {
	NodeId             *int64     `json:"node_id"`
	Arn                *string    `json:"arn"`
	AccountId          *string    `json:"account_id"`
	UserIdentifier     *string    `json:"user_identifier"`
	AvailabilityZone   *string    `json:"availability_zone"`
	EndpointAddress    *string    `json:"endpoint_address"`
	EndpointPort       *int64     `json:"endpoint_port"`
	Engine             *string    `json:"engine"`
	CreateTime         *time.Time `json:"create_time"`
	PubliclyAccessible *bool      `json:"publicly_accessible"`
	StorageEncrypted   *bool      `json:"storage_encrypted"`
	IsCrownJewel       *bool      `json:"is_crown_jewel"`
}

func RetrieveRdsInstances(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(r:RDSInstance)
		RETURN ID(r) as node_id,
		r.arn as arn,
		a.id as account_id,
		r.db_instance_identifier as user_identifier,
		r.availability_zone as availability_zone,
		r.endpoint_address as endpoint_address,
		r.endpoint_port as endpoint_port,
		r.engine as engine,
		r.instance_create_time as create_time,
		r.publicly_accessible as publicly_accessible,
		r.storage_encrypted as storage_encrypted,
		r.is_crown_jewel as is_crown_jewel`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedRdsInstances []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		NodeIdInt, err := util.ParseAsOptionalInt64(record, "node_id")
		multierror.Append(parsingErrs, err)
		arnStr, err := util.ParseAsOptionalString(record, "arn")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		userIdentifierStr, err := util.ParseAsOptionalString(record, "user_identifier")
		multierror.Append(parsingErrs, err)
		availabilityZoneStr, err := util.ParseAsOptionalString(record, "availability_zone")
		multierror.Append(parsingErrs, err)
		endpointAddressStr, err := util.ParseAsOptionalString(record, "endpoint_address")
		multierror.Append(parsingErrs, err)
		endpointPortInt64, err := util.ParseAsOptionalInt64(record, "endpoint_port")
		multierror.Append(parsingErrs, err)
		engineStr, err := util.ParseAsOptionalString(record, "engine")
		multierror.Append(parsingErrs, err)
		createTime, err := util.ParseAsOptionalTime(record, "create_time")
		multierror.Append(parsingErrs, err)
		publiclyAccessibleBool, err := util.ParseAsOptionalBool(record, "publicly_accessible")
		multierror.Append(parsingErrs, err)
		storageEncryptedBool, err := util.ParseAsOptionalBool(record, "storage_encrypted")
		multierror.Append(parsingErrs, err)
		isCrownJewelBool, err := util.ParseAsOptionalBool(record, "is_crown_jewel")
		multierror.Append(parsingErrs, err)

		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedRdsInstances = append(retrievedRdsInstances, RdsIntance{
			NodeId:             NodeIdInt,
			Arn:                arnStr,
			AccountId:          accountIDStr,
			UserIdentifier:     userIdentifierStr,
			AvailabilityZone:   availabilityZoneStr,
			EndpointAddress:    endpointAddressStr,
			EndpointPort:       endpointPortInt64,
			Engine:             engineStr,
			CreateTime:         createTime,
			PubliclyAccessible: publiclyAccessibleBool,
			StorageEncrypted:   storageEncryptedBool,
			IsCrownJewel:       isCrownJewelBool,
		})
	}

	return retrievedRdsInstances, nil
}
