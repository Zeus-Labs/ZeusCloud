package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/rules/processgraph"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type AccessExplorerRequest struct {
	resourceId string
	actionStr  string
}

func iamPrincipalInboundPaths(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["PrincipalId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPrincipal{arn: $PrincipalId})
		OPTIONAL MATCH
			genEffectivePath=
			(startNode)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION|IS_EFFECTIVE_ADMIN|
			EFFECTIVE_ADMIN_ACCESS*0..7]->(p) 
		WHERE SIZE(apoc.coll.toSet(NODES(genEffectivePath))) = LENGTH(genEffectivePath) + 1 AND
		(startNode:AWSUser OR startNode:AWSRole)
		WITH p, collect(genEffectivePath) as genEffectivePaths
		WITH genEffectivePaths as paths
		RETURN paths
		`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

// Iam principals reachable from given resource id.
func iamPrincipalOutboundPaths(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["PrincipalId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPrincipal{arn: $PrincipalId})
		OPTIONAL MATCH
			genEffectivePath=
			(p)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION|IS_EFFECTIVE_ADMIN*0..6]->(endNode)
		WITH p, collect(genEffectivePath) as genEffectivePaths
		WITH genEffectivePaths as paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

// Principals reachable from VM's attached role
func ec2ReachableOutboundPaths(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["InstanceId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance{id: $InstanceId})
		OPTIONAL MATCH
			vmRolePath=(e)-[r:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole)
		WITH role, collect(vmRolePath) as vmRolePaths
		OPTIONAL MATCH
			genEffectivePath=
			(role)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION|IS_EFFECTIVE_ADMIN*0..6]->(endNode)
		WITH role, vmRolePaths, collect(genEffectivePath) as genEffectivePaths
		WITH vmRolePaths + genEffectivePaths as paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

// Principals that can effectively act on s3 bucket
func getS3EffectiveActionPrincipals(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	params := map[string]interface{}{
		"BucketName": req.resourceId,
		"ActionStr":  req.actionStr,
	}
	log.Printf("Bucket Name = %v, action str = %v \n", params["BucketName"], params["ActionStr"])
	// TODO: acl.uri for public access.
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(s:S3Bucket{name: $BucketName})
		OPTIONAL MATCH
			principalActionAccessPath=
			(p:AWSPrincipal)-[r:HAS_POLICY_ACCESS]->(s)
			WHERE any(action in r.actions WHERE action=$ActionStr)
		WITH s, p, collect(principalActionAccessPath) as principalActionAccessPaths
		OPTIONAL MATCH
			principalPath=
			(startPrincipal:AWSPrincipal)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(p)
		WITH s, p, principalActionAccessPaths, collect(principalPath) as principalPaths
		OPTIONAL MATCH
			allAccountsPath=
			(g:GenericAwsAccount)-[r:HAS_POLICY_ACCESS]->(s)
			WHERE any(action in r.actions WHERE action=$ActionStr)
		WITH s, p, principalActionAccessPaths, principalPaths, collect(allAccountsPath) as allAccountsPaths
		OPTIONAL MATCH
			allAccountsAclPath=
			(g:GenericAwsAccount)-[r:HAS_ACL_ACCESS]->(s)
			WHERE any(action in r.actions WHERE action=$ActionStr)
		WITH s, p, principalActionAccessPaths, principalPaths, allAccountsPaths, 
		collect(allAccountsAclPath) as allAccountsAclPaths
		WITH principalActionAccessPaths + principalPaths + allAccountsPaths + allAccountsAclPaths as paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

type AccessExplorerGraphProducer func(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error)

var producerMapping = map[string]map[string]AccessExplorerGraphProducer{
	"iamUsers": {
		"reachableFrom": iamPrincipalOutboundPaths,
		"reachableTo":   iamPrincipalInboundPaths,
	},
	"iamRoles": {
		"reachableFrom": iamPrincipalOutboundPaths,
		"reachableTo":   iamPrincipalInboundPaths,
	},
	"ec2Instances": {
		"reachableFrom": ec2ReachableOutboundPaths,
	},
	"s3Buckets": {
		"reachableAction": getS3EffectiveActionPrincipals,
	},
}

func GetAccessExplorerGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		resourceType := r.URL.Query().Get("resource_type")
		queryType := r.URL.Query().Get("query_type")
		resourceId := r.URL.Query().Get("resource_id")
		actionStr := r.URL.Query().Get("action_type")

		// TODO: Basic input validation to avoid any injection attacks.

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
			records, err := producerFunc(tx, AccessExplorerRequest{
				resourceId: resourceId,
				actionStr:  actionStr,
			})
			if err != nil {
				log.Printf("failed to retrieve access explorer graph results error: %v", err)
				http.Error(w, "failed to retrieve access explorer graph results", 500)
				return nil, err
			}
			log.Printf("records=%+v/n", records)
			graph, err := processgraph.ProcessGraphPathResult(records, "paths")
			if err != nil {
				return nil, err
			}
			graphPathResult := processgraph.CompressPaths(graph)
			displayGraph, err := processgraph.ConvertToDisplayGraph(graphPathResult)
			return displayGraph, err
		})
		if err != nil {
			log.Printf("failed to retrieve access explorer graph results error: %v", err)
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
