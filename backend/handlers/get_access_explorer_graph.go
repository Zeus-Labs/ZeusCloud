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

func iamPrincipalReachableTo(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["PrincipalId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPrincipal{arn: $PrincipalId})
		OPTIONAL MATCH
			genEffectivePath=
			(aPrincipal:AWSPrincipal)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(p)
		WITH p, collect(genEffectivePath) as genEffectivePaths
		OPTIONAL MATCH
			effectiveAdminPath=
			(:AWSPrincipal)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->
			(:AWSPrincipal)-[:IS_EFFECTIVE_ADMIN]->(eAdmin:AWSEffectiveAdmin)
		WITH p, genEffectivePaths, collect(effectiveAdminPath) as effectiveAdminPaths
		WITH genEffectivePaths + effectiveAdminPaths as paths
		RETURN paths
		`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

// Iam principals reachable from given resource id.
func iamPrincipalReachableFrom(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["PrincipalId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(p:AWSPrincipal{arn: $PrincipalId})
		OPTIONAL MATCH
			genEffectivePath=
			(p)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(aPrincipal:AWSPrincipal)
		WITH p, collect(genEffectivePath) as genEffectivePaths
		OPTIONAL MATCH
			effectiveAdminPath=
			(p)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(:AWSPrincipal)
			-[:IS_EFFECTIVE_ADMIN]->(:AWSEffectiveAdmin)
		WITH p, genEffectivePaths, collect(effectiveAdminPath) as effectiveAdminPaths
		WITH genEffectivePaths + effectiveAdminPaths as paths
		RETURN paths`,
		params)
	if err != nil {
		return nil, err
	}
	return records, nil
}

// Principals reachable from VM's attached role
func ec2ReachableFrom(tx neo4j.Transaction, req AccessExplorerRequest) (neo4j.Result, error) {
	var params = make(map[string]interface{})
	params["InstanceId"] = req.resourceId
	records, err := tx.Run(
		`MATCH (a:AWSAccount{inscope: true})-[:RESOURCE]->(e:EC2Instance{id: $InstanceId})
		OPTIONAL MATCH
			vmRolePath=(e)-[r:STS_ASSUME_ROLE_ALLOW]->(role:AWSRole)
		WITH role, collect(vmRolePath) as vmRolePaths
		OPTIONAL MATCH
			genEffectivePath=
			(role)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(aPrincipal:AWSPrincipal)
		WITH role, vmRolePaths, collect(genEffectivePath) as genEffectivePaths
		OPTIONAL MATCH
			effectiveAdminPath=
			(role)-[:STS_ASSUME_ROLE_ALLOW|PRIVILEGE_ESCALATION*0..5]->(AWSPrincipal)
			-[:IS_EFFECTIVE_ADMIN]->(d)
		WITH vmRolePaths, genEffectivePaths, collect(effectiveAdminPath) as effectiveAdminPaths
		WITH vmRolePaths + genEffectivePaths + effectiveAdminPaths as paths
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
		"reachableFrom": iamPrincipalReachableFrom,
		"reachableTo":   iamPrincipalReachableTo,
	},
	"iamRoles": {
		"reachableFrom": iamPrincipalReachableFrom,
		"reachableTo":   iamPrincipalReachableTo,
	},
	"ec2Instances": {
		"reachableFrom": ec2ReachableFrom,
	},
	"s3Buckets": {
		"reachableAction": getS3EffectiveActionPrincipals,
	},
}

func GetAccessExplorerGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
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
			log.Printf("graph=%+v/n", graph)
			graphPathResult := processgraph.CompressPaths(graph)
			log.Println("graphPathResult=", graphPathResult)
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
