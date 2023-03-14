package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamUser struct {
	Arn              string     `json:"arn"`
	AccountId        string     `json:"account_id"`
	FriendlyName     string     `json:"friendly_name"`
	CreateDate       time.Time  `json:"create_date"`
	PasswordLastUsed *time.Time `json:"password_last_used"`
	IamGroups        []string   `json:"iam_groups"`
	IamRoles         []string   `json:"iam_roles"`
	IamPolicies      []string   `json:"iam_policies"`
	AccessKeys       []string   `json:"access_keys"`
}

func RetrieveIamUsers(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(u:AWSUser)
		OPTIONAL MATCH (u)-[:MEMBER_AWS_GROUP]->(g:AWSGroup)
		WITH a, u, collect(g.arn) as group_arns
		OPTIONAL MATCH (u)-[:STS_ASSUME_ROLE_ALLOW]->(r:AWSRole)
		WITH a, u, group_arns, collect(r.arn) as role_arns
		OPTIONAL MATCH (u)-[:POLICY]->(p:AWSPolicy)
		WITH a, u, group_arns, role_arns, collect(p.id) as policy_ids
		OPTIONAL MATCH (u)-[:AWS_ACCESS_KEY]->(k:AccountAccessKey)
		WITH a, u, group_arns, role_arns, policy_ids, collect(k.accesskeyid) as access_key_ids
		RETURN u.arn as arn,
		a.id as account_id,
		u.name as friendly_name,
		u.createdate as create_date,
		u.passwordlastused as password_last_used,
		group_arns as iam_groups,
		role_arns as iam_roles,
		policy_ids as iam_policies,
		access_key_ids as access_keys`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedIamUsers []interface{}
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
		friendlyName, _ := record.Get("friendly_name")
		friendlyNameStr, ok := friendlyName.(string)
		if !ok {
			return nil, fmt.Errorf("friendly_name %v should be of type string", friendlyNameStr)
		}
		createDateTime, err := util.ParseAsTime(record, "create_date")
		if err != nil {
			return nil, err
		}
		passwordLastUsedTime := util.ParseAsOptionalTime(record, "password_last_used")
		iamGroupsLst, err := util.ParseAsStringList(record, "iam_groups")
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
		accessKeysLst, err := util.ParseAsStringList(record, "access_keys")
		if err != nil {
			return nil, err
		}
		retrievedIamUsers = append(retrievedIamUsers, IamUser{
			Arn:              arnStr,
			AccountId:        accountIDStr,
			FriendlyName:     friendlyNameStr,
			CreateDate:       createDateTime,
			PasswordLastUsed: passwordLastUsedTime,
			IamGroups:        iamGroupsLst,
			IamRoles:         iamRolesLst,
			IamPolicies:      iamPoliciesLst,
			AccessKeys:       accessKeysLst,
		})
	}

	return retrievedIamUsers, nil
}
