package handlers

import (
	"github.com/Zeus-Labs/ZeusCloud/rules"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"log"
	"net/http"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func GetRuleGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Entered Get Rule Graph \n")
		resourceId := r.URL.Query().Get("resource")
		ruleId := r.URL.Query().Get("ruleid")

		var attackPathRuleDisplay types.Rule
		var attackPathFound bool
		for _, attackpathRule := range rules.AttackPathsRulesToExecute {
			if attackpathRule.UID() == ruleId {
				attackPathFound = true
				attackPathRuleDisplay = attackpathRule
			}
		}

		if !attackPathFound {
			log.Println("Invalid rule to graph provided")
			http.Error(w, "Invalid rule to graph provided", 500)
			return
		}

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeRead,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		// TODO: parse the return
		_, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {

			graphPathResult, err := attackPathRuleDisplay.ProduceRuleGraph(tx, resourceId)
			if err != nil {
				log.Printf("failed to retrieve rule graph results")
				http.Error(w, "failed to retrieve rule graph results", 500)
				return graphPathResult, err
			}
			log.Printf("Produce Rule Graph Error %+v", err)
			return graphPathResult, err
		})
		if err != nil {
			log.Printf("failed to retrieve rule graph results")
			http.Error(w, "failed to retrieve rule graph results", 500)
			return
		}
	}
}
