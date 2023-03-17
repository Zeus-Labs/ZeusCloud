package inventory

import (
	"fmt"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/util"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type LambdaFunction struct {
	Arn          string    `json:"arn"`
	AccountId    string    `json:"account_id"`
	Name         string    `json:"name"`
	ModifiedDate time.Time `json:"modified_date"`
	State        string    `json:"state"`
	Runtime      string    `json:"runtime"`
	IamRoles     []string  `json:"iam_roles"`
}

func RetrieveLambdaFunctions(tx neo4j.Transaction) ([]interface{}, error) {
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(l:AWSLambda)
		OPTIONAL MATCH (l)-[:STS_ASSUME_ROLE_ALLOW]->(r:AWSRole)
		WITH a, l, collect(r.arn) as role_arns
		RETURN l.id as arn,
		a.id as account_id,
		l.name as name,
		l.modifieddate as modified_date,
		l.state as state,
		l.runtime as runtime,
		e.state as state,
		role_arns as iam_roles`,
		nil,
	)
	if err != nil {
		return nil, err
	}
	var retrievedLambdaFunctions []interface{}
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
		name, _ := record.Get("name")
		nameStr, ok := name.(string)
		if !ok {
			return nil, fmt.Errorf("name %v should be of type string", nameStr)
		}
		modifiedDate, err := util.ParseAsTimeISO8601(record, "modified_date")
		if err != nil {
			return nil, err
		}
		state, _ := record.Get("state")
		stateStr, ok := state.(string)
		if !ok {
			return nil, fmt.Errorf("state %v should be of type string", stateStr)
		}
		runtime, _ := record.Get("runtime")
		runtimeStr, ok := runtime.(string)
		if !ok {
			return nil, fmt.Errorf("runtime %v should be of type string", runtimeStr)
		}
		iamRolesLst, err := util.ParseAsStringList(record, "iam_roles")
		if err != nil {
			return nil, err
		}
		retrievedLambdaFunctions = append(retrievedLambdaFunctions, LambdaFunction{
			Arn:          arnStr,
			AccountId:    accountIDStr,
			Name:         nameStr,
			ModifiedDate: modifiedDate,
			State:        stateStr,
			Runtime:      runtimeStr,
			IamRoles:     iamRolesLst,
		})
	}

	return retrievedLambdaFunctions, nil
}
