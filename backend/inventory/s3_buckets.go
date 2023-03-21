package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type S3Bucket struct {
	Name              *string `json:"name"`
	AccountId         *string `json:"account_id"`
	Region            *string `json:"region"`
	DefaultEncryption *bool   `json:"default_encryption"`
	VersioningStatus  *string `json:"versioning_status"`
	MfaDelete         *string `json:"mfa_delete"`
}

func RetrieveS3Buckets(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket)
		RETURN s.name as name,
		a.id as account_id,
		s.region as region,
		s.default_encryption as default_encryption,
		s.versioning_status as versioning_status,
		s.mfa_delete as mfa_delete`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedS3Buckets []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		nameStr, err := util.ParseAsOptionalString(record, "name")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		regionStr, err := util.ParseAsOptionalString(record, "region")
		multierror.Append(parsingErrs, err)
		defaultEncryptionBool, err := util.ParseAsOptionalBool(record, "default_encryption")
		multierror.Append(parsingErrs, err)
		versioningStatusStr, err := util.ParseAsOptionalString(record, "versioning_status")
		multierror.Append(parsingErrs, err)
		mfaDeleteStr, err := util.ParseAsOptionalString(record, "mfa_delete")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedS3Buckets = append(retrievedS3Buckets, S3Bucket{
			Name:              nameStr,
			AccountId:         accountIDStr,
			Region:            regionStr,
			DefaultEncryption: defaultEncryptionBool,
			VersioningStatus:  versioningStatusStr,
			MfaDelete:         mfaDeleteStr,
		})
	}

	return retrievedS3Buckets, nil
}
