package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamRole struct {
	NodeId    *int64  `json:"node_id"`
	Arn       *string `json:"arn"`
	AccountId *string `json:"account_id"`
	// FriendlyName      *string   `json:"friendly_name"` TODO: cartography doesn't have this right now
	CreateDate        *time.Time `json:"create_date"`
	IamRoles          []string   `json:"iam_roles"`
	IamPolicies       []string   `json:"iam_policies"`
	TrustedPrincipals []string   `json:"trusted_principals"`
	IsCrownJewel      *bool      `json:"is_crown_jewel"`
}

func RetrieveIamRoles(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(r:AWSRole)
		OPTIONAL MATCH (r)-[:STS_ASSUME_ROLE_ALLOW]->(r1:AWSRole)
		WITH a, r, collect(r1.arn) as role_arns
		OPTIONAL MATCH (r)-[:POLICY]->(p:AWSPolicy)
		WITH a, r, role_arns, collect(p.id) as policy_ids
		OPTIONAL MATCH (r)-[:TRUSTS_AWS_PRINCIPAL]->(p:AWSPrincipal)
		WITH a, r, role_arns, policy_ids, collect(p.arn) as principal_arns
		RETURN ID(r) as node_id,
		r.arn as arn,
		a.id as account_id,
		r.createdate as create_date,
		r.is_crown_jewel as is_crown_jewel,
		role_arns as iam_roles,
		policy_ids as iam_policies,
		principal_arns as trusted_principals`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedIamRoles []interface{}
	for records.Next() {
		record := records.Record()

		var parsingErrs error
		NodeIdInt, err := util.ParseAsOptionalInt64(record, "node_id")
		multierror.Append(parsingErrs, err)
		arnStr, err := util.ParseAsOptionalString(record, "arn")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		createDateTime, err := util.ParseAsOptionalTime(record, "create_date")
		multierror.Append(parsingErrs, err)
		iamRolesLst, err := util.ParseAsOptionalStringList(record, "iam_roles")
		multierror.Append(parsingErrs, err)
		iamPoliciesLst, err := util.ParseAsOptionalStringList(record, "iam_policies")
		multierror.Append(parsingErrs, err)
		trustedPrincipalsLst, err := util.ParseAsOptionalStringList(record, "trusted_principals")
		multierror.Append(parsingErrs, err)
		isCrownJewelBool, err := util.ParseAsOptionalBool(record, "is_crown_jewel")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedIamRoles = append(retrievedIamRoles, IamRole{
			NodeId:            NodeIdInt,
			Arn:               arnStr,
			AccountId:         accountIDStr,
			CreateDate:        createDateTime,
			IamRoles:          iamRolesLst,
			IamPolicies:       iamPoliciesLst,
			TrustedPrincipals: trustedPrincipalsLst,
			IsCrownJewel:      isCrownJewelBool,
		})
	}

	return retrievedIamRoles, nil
}
