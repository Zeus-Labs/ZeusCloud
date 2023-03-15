package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/rules/attackpath"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

//var ruleGraphCategoryMap = map[string]AssetRetriever{
//	"iamUser":  inventory.RetrieveIamUsers,
//	"iamGroup": inventory.RetrieveIamGroups,
//	"iamRole":  inventory.RetrieveIamRoles,
//}

func GetRuleGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Entered GetRuleGraph\n")
		log.Printf("TESTING LOG \n")
		ruleGraph := r.URL.Query().Get("rulegraph")

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeRead,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		_, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
			fmt.Printf("Entered GetRuleGraph\n")

			attackpathRule := attackpath.PubliclyExposedVmAdmin{}
			return attackpathRule.ProduceRuleGraph(tx, ruleGraph)
		})
		if err != nil {
			log.Printf("failed to retrieve rule graph results")
			http.Error(w, "failed to retrieve rule graph results", 500)
			return
		}
		//resultsArr, ok := results.([]types.GraphPathResult)
		//if !ok {
		//	return nil, fmt.Errorf("issue type casting results %v", results)
		//}
		//return resultsArr, nil

	}
}
