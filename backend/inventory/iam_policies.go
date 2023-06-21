package inventory

import (
	"log"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamPolicy struct {
	NodeId       *int64   `json:"node_id"`
	Id           *string  `json:"id"`
	AccountId    *string  `json:"account_id"`
	Name         *string  `json:"name"`
	PolicyType   *string  `json:"policy_type"`
	IamUsers     []string `json:"iam_users"`
	IamGroups    []string `json:"iam_groups"`
	IamRoles     []string `json:"iam_roles"`
	IsCrownJewel *bool    `json:"is_crown_jewel"`
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
		RETURN ID(p) as node_id,
		p.id as id,
		a.id as account_id,
		p.name as name,
		p.type as policy_type,
		p.is_crown_jewel as is_crown_jewel,
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

		var parsingErrs error
		NodeIdInt, err := util.ParseAsOptionalInt64(record, "node_id")
		multierror.Append(parsingErrs, err)
		idStr, err := util.ParseAsOptionalString(record, "id")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		nameStr, err := util.ParseAsOptionalString(record, "name")
		multierror.Append(parsingErrs, err)
		policyTypeStr, err := util.ParseAsOptionalString(record, "policy_type")
		multierror.Append(parsingErrs, err)
		iamUsersLst, err := util.ParseAsOptionalStringList(record, "iam_users")
		multierror.Append(parsingErrs, err)
		iamGroupsLst, err := util.ParseAsOptionalStringList(record, "iam_groups")
		multierror.Append(parsingErrs, err)
		iamRolesLst, err := util.ParseAsOptionalStringList(record, "iam_roles")
		multierror.Append(parsingErrs, err)
		isCrownJewelBool, err := util.ParseAsOptionalBool(record, "is_crown_jewel")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedIamPolicies = append(retrievedIamPolicies, IamPolicy{
			NodeId:       NodeIdInt,
			Id:           idStr,
			AccountId:    accountIDStr,
			Name:         nameStr,
			PolicyType:   policyTypeStr,
			IamUsers:     iamUsersLst,
			IamGroups:    iamGroupsLst,
			IamRoles:     iamRolesLst,
			IsCrownJewel: isCrownJewelBool,
		})
	}

	return retrievedIamPolicies, nil
}
