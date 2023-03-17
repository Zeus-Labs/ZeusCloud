package inventory

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamPolicy struct {
	Id         string   `json:"id"`
	AccountId  string   `json:"account_id"`
	Name       string   `json:"name"`
	PolicyType string   `json:"policy_type"`
	IamUsers   []string `json:"iam_users"`
	IamGroups  []string `json:"iam_groups"`
	IamRoles   []string `json:"iam_roles"`
}

func RetrieveIamPolicies(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPolicy)
		OPTIONAL MATCH (p)<-[:POLICY]-(u:AWSUser)
		WITH a, p, collect(u.arn) as user_arns
		OPTIONAL MATCH (p)<-[:POLICY]-(g:AWSGroup)
		WITH a, p, user_arns, collect(g.arn) as group_arns
		OPTIONAL MATCH (p)<-[:POLICY]-(r:AWSRole)
		WITH a, p, user_arns, group_arns, collect(r.arn) as role_arns
		RETURN p.id as id,
		a.id as account_id,
		p.name as name,
		p.type as policy_type,
		user_arns as iam_users,
		group_arns as iam_groups,
		role_arns as iam_roles`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedIamPolicies []interface{}
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
		name, _ := record.Get("name")
		nameStr, ok := name.(string)
		if !ok {
			return nil, fmt.Errorf("friendly_name %v should be of type string", nameStr)
		}
		policyType, _ := record.Get("policy_type")
		policyTypeStr, ok := policyType.(string)
		if !ok {
			return nil, fmt.Errorf("policy_type %v should be of type string", policyTypeStr)
		}
		iamUsersLst, err := util.ParseAsStringList(record, "iam_users")
		if err != nil {
			return nil, err
		}
		iamGroupsLst, err := util.ParseAsStringList(record, "iam_groups")
		if err != nil {
			return nil, err
		}
		iamRolesLst, err := util.ParseAsStringList(record, "iam_roles")
		if err != nil {
			return nil, err
		}
		retrievedIamPolicies = append(retrievedIamPolicies, IamPolicy{
			Id:         idStr,
			AccountId:  accountIDStr,
			Name:       nameStr,
			PolicyType: policyTypeStr,
			IamUsers:   iamUsersLst,
			IamGroups:  iamGroupsLst,
			IamRoles:   iamRolesLst,
		})
	}

	return retrievedIamPolicies, nil
}
