package inventory

import (
	"log"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/hashicorp/go-multierror"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type IamGroup struct {
	NodeId       *int64     `json:"node_id"`
	Arn          *string    `json:"arn"`
	AccountId    *string    `json:"account_id"`
	FriendlyName *string    `json:"friendly_name"`
	CreateDate   *time.Time `json:"create_date"`
	IamUsers     []string   `json:"iam_users"`
	IamRoles     []string   `json:"iam_roles"`
	IamPolicies  []string   `json:"iam_policies"`
	IsCrownJewel *bool      `json:"is_crown_jewel"`
}

func RetrieveIamGroups(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(g:AWSGroup)
		OPTIONAL MATCH (g)<-[:MEMBER_AWS_GROUP]-(u:AWSUser)
		WITH a, g, collect(u.arn) as user_arns
		OPTIONAL MATCH (g)-[:STS_ASSUME_ROLE_ALLOW]->(r:AWSRole)
		WITH a, g, user_arns, collect(r.arn) as role_arns
		OPTIONAL MATCH (g)-[:POLICY]->(p:AWSPolicy)
		WITH a, g, user_arns, role_arns, collect(p.id) as policy_ids
		RETURN ID(g) as node_id,
		g.arn as arn,
		a.id as account_id,
		g.name as friendly_name,
		g.is_crown_jewel as is_crown_jewel,
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

		var parsingErrs error
		NodeIdInt, err := util.ParseAsOptionalInt64(record, "node_id")
		multierror.Append(parsingErrs, err)
		arnStr, err := util.ParseAsOptionalString(record, "arn")
		multierror.Append(parsingErrs, err)
		accountIDStr, err := util.ParseAsOptionalString(record, "account_id")
		multierror.Append(parsingErrs, err)
		friendlyNameStr, err := util.ParseAsOptionalString(record, "friendly_name")
		multierror.Append(parsingErrs, err)
		createDateTime, err := util.ParseAsOptionalTime(record, "create_date")
		multierror.Append(parsingErrs, err)
		iamUsersLst, err := util.ParseAsOptionalStringList(record, "iam_users")
		multierror.Append(parsingErrs, err)
		iamRolesLst, err := util.ParseAsOptionalStringList(record, "iam_roles")
		multierror.Append(parsingErrs, err)
		iamPoliciesLst, err := util.ParseAsOptionalStringList(record, "iam_policies")
		multierror.Append(parsingErrs, err)
		isCrownJewelBool, err := util.ParseAsOptionalBool(record, "is_crown_jewel")
		multierror.Append(parsingErrs, err)
		if parsingErrs != nil {
			log.Printf("Encountered errors parsing resource: %v, continuing on...", parsingErrs.Error())
		}

		retrievedIamGroups = append(retrievedIamGroups, IamGroup{
			NodeId:       NodeIdInt,
			Arn:          arnStr,
			AccountId:    accountIDStr,
			FriendlyName: friendlyNameStr,
			CreateDate:   createDateTime,
			IamUsers:     iamUsersLst,
			IamRoles:     iamRolesLst,
			IamPolicies:  iamPoliciesLst,
			IsCrownJewel: isCrownJewelBool,
		})
	}

	return retrievedIamGroups, nil
}
