package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules"
	"github.com/Zeus-Labs/ZeusCloud/rules/processgraph"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"log"
	"net/http"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func GetRuleGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		resourceId := r.URL.Query().Get("resource_id")
		ruleId := r.URL.Query().Get("rule_id")

		var attackPathRuleDisplay types.Rule
		var attackPathFound bool
		for _, attackpathRule := range rules.AttackPathsRulesToExecute {
			if attackpathRule.UID() == ruleId {
				attackPathFound = true
				attackPathRuleDisplay = attackpathRule
				break
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

		results, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {

			records, err := attackPathRuleDisplay.ProduceRuleGraph(tx, resourceId)
			if err != nil {
				log.Printf("failed to retrieve rule graph results")
				http.Error(w, "failed to retrieve rule graph results", 500)
				return nil, err
			}
			graph, err := processgraph.ProcessGraphPathResult(records, "paths")
			if err != nil {
				return nil, err
			}

			// Check that all the paths start with the correct node.
			pathCheckBool, pathsFailing := processgraph.GraphStartNodeCheck(graph)
			if !pathCheckBool {
				return nil, fmt.Errorf("Error %v Paths Failing %+v", err.Error(), pathsFailing)
			}

			graphPathResult := processgraph.CompressPaths(graph)

			displayGraph, err := processgraph.ConvertToDisplayGraph(graphPathResult)
			return displayGraph, err
		})
		if err != nil {
			log.Printf("failed to retrieve rule graph results")
			http.Error(w, "failed to retrieve rule graph results", 500)
			return
		}

		retDataBytes, err := json.Marshal(results.(types.DisplayGraph))
		if err != nil {
			log.Printf("failed to marshal %v error: %v", results, err)
			http.Error(w, "failed get rule graph results", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
