package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/rules/processgraph"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func iamPrincipalReachableFrom(tx neo4j.Transaction, resourceId string) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["PrincipalId"] = resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPrincipal{arn: $PrincipalId})
		OPTIONAL MATCH
			path=
			(p)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(:AWSPrincipal)
		WITH p, collect(path) as paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

type AccessExplorerGraphProducer func(tx neo4j.Transaction, resourceId string) (neo4j.Result, error)

var producerMapping = map[string]map[string]AccessExplorerGraphProducer{
	"iamUsers": {
		"reachableFrom": iamPrincipalReachableFrom,
	},
	"iamRoles": {
		"reachableFrom": iamPrincipalReachableFrom,
	},
}

func GetAccessExplorerGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		resourceType := r.URL.Query().Get("resource_type")
		queryType := r.URL.Query().Get("query_type")
		resourceId := r.URL.Query().Get("resource_id")

		_, ok := producerMapping[resourceType]
		if !ok {
			log.Printf("invalid resource type %v", resourceType)
			http.Error(w, "invalid resource type ", 400)
			return
		}
		producerFunc, ok := producerMapping[resourceType][queryType]
		if !ok {
			log.Printf("invalid query type %v", queryType)
			http.Error(w, "invalid query type", 400)
			return
		}

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeRead,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		results, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
			records, err := producerFunc(tx, resourceId)
			if err != nil {
				log.Printf("failed to retrieve access explorer graph results")
				http.Error(w, "failed to retrieve access explorer graph results", 500)
				return nil, err
			}
			graph, err := processgraph.ProcessGraphPathResult(records, "paths")
			if err != nil {
				return nil, err
			}

			graphPathResult := processgraph.CompressPaths(graph)

			displayGraph, err := processgraph.ConvertToDisplayGraph(graphPathResult)
			return displayGraph, err
		})
		if err != nil {
			log.Printf("failed to retrieve access explorer graph results")
			http.Error(w, "failed to retrieve access explorer graph results", 500)
			return
		}

		retDataBytes, err := json.Marshal(results.(types.DisplayGraph))
		if err != nil {
			log.Printf("failed to marshal %v error: %v", results, err)
			http.Error(w, "failed get access explorer graph results", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
