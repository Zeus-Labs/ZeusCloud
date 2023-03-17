package inventory

import (
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type S3Bucket struct {
	Name              string `json:"name"`
	AccountId         string `json:"account_id"`
	Region            string `json:"region"`
	DefaultEncryption bool   `json:"default_encryption"`
	VersioningStatus  string `json:"versioning_status"`
	MfaDelete         string `json:"mfa_delete"`
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
		name, _ := record.Get("name")
		nameStr, ok := name.(string)
		if !ok {
			return nil, fmt.Errorf("name %v should be of type string", nameStr)
		}
		accountID, _ := record.Get("account_id")
		accountIDStr, ok := accountID.(string)
		if !ok {
			return nil, fmt.Errorf("account_id %v should be of type string", accountIDStr)
		}
		region, _ := record.Get("region")
		regionStr, ok := region.(string)
		if !ok {
			return nil, fmt.Errorf("region %v should be of type string", regionStr)
		}
		defaultEncryption, _ := record.Get("default_encryption")
		defaultEncryptionBool, ok := defaultEncryption.(bool)
		if !ok {
			return nil, fmt.Errorf("default_encryption %v should be of type bool", defaultEncryptionBool)
		}
		versioningStatus, _ := record.Get("versioning_status")
		versioningStatusStr, ok := versioningStatus.(string)
		if !ok {
			return nil, fmt.Errorf("versioning_status %v should be of type string", versioningStatusStr)
		}
		mfaDelete, _ := record.Get("mfa_delete")
		mfaDeleteStr, ok := mfaDelete.(string)
		if !ok {
			return nil, fmt.Errorf("mfa_delete %v should be of type string", mfaDeleteStr)
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
