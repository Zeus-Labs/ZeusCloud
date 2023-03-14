package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamRole struct {
	Arn       string `json:"arn"`
	AccountId string `json:"account_id"`
	// FriendlyName      string   `json:"friendly_name"` TODO: cartography doesn't have this right now
	CreateDate        time.Time `json:"create_date"`
	IamRoles          []string  `json:"iam_roles"`
	IamPolicies       []string  `json:"iam_policies"`
	TrustedPrincipals []string  `json:"trusted_principals"`
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
		RETURN r.arn as arn,
		a.id as account_id,
		r.createdate as create_date,
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
		createDateTime, err := util.ParseAsTime(record, "create_date")
		if err != nil {
			return nil, err
		}
		iamRolesLst, err := util.ParseAsStringList(record, "iam_roles")
		if err != nil {
			return nil, err
		}
		iamPoliciesLst, err := util.ParseAsStringList(record, "iam_policies")
		if err != nil {
			return nil, err
		}
		trustedPrincipalsLst, err := util.ParseAsStringList(record, "trusted_principals")
		if err != nil {
			return nil, err
		}
		retrievedIamRoles = append(retrievedIamRoles, IamRole{
			Arn:               arnStr,
			AccountId:         accountIDStr,
			CreateDate:        createDateTime,
			IamRoles:          iamRolesLst,
			IamPolicies:       iamPoliciesLst,
			TrustedPrincipals: trustedPrincipalsLst,
		})
	}

	return retrievedIamRoles, nil
}
