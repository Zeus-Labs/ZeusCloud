package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamGroup struct {
	Arn          string    `json:"arn"`
	AccountId    string    `json:"account_id"`
	FriendlyName string    `json:"friendly_name"`
	CreateDate   time.Time `json:"create_date"`
	IamUsers     []string  `json:"iam_users"`
	IamRoles     []string  `json:"iam_roles"`
	IamPolicies  []string  `json:"iam_policies"`
}

func RetrieveIamGroups(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(g:AWSGroup)
		OPTIONAL MATCH (g:AWSGroup)<-[:MEMBER_AWS_GROUP]-(u:AWSUser)
		WITH a, g, collect(u.arn) as user_arns
		OPTIONAL MATCH (g)-[:STS_ASSUME_ROLE_ALLOW]->(r:AWSRole)
		WITH a, g, user_arns, collect(r.arn) as role_arns
		OPTIONAL MATCH (g)-[:POLICY]->(p:AWSPolicy)
		WITH a, g, user_arns, role_arns, collect(p.id) as policy_ids
		RETURN g.arn as arn,
		a.id as account_id,
		g.name as friendly_name,
		g.createdate as create_date,
		user_arns as iam_users,
		role_arns as iam_roles,
		policy_ids as iam_policies`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedIamGroups []interface{}
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
		iamUsersLst, err := util.ParseAsStringList(record, "iam_users")
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
		retrievedIamGroups = append(retrievedIamGroups, IamGroup{
			Arn:          arnStr,
			AccountId:    accountIDStr,
			FriendlyName: friendlyNameStr,
			CreateDate:   createDateTime,
			IamUsers:     iamUsersLst,
			IamRoles:     iamRolesLst,
			IamPolicies:  iamPoliciesLst,
		})
	}

	return retrievedIamGroups, nil
}
