package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/inventory"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type AssetRetriever func(tx neo4j.Transaction) ([]interface{}, error)

var assetCategoryMap = map[string]AssetRetriever{
	"iamUsers":               inventory.RetrieveIamUsers,
	"iamGroups":              inventory.RetrieveIamGroups,
	"iamRoles":               inventory.RetrieveIamRoles,
	"iamPolicies":            inventory.RetrieveIamPolicies,
	"ec2Instances":           inventory.RetrieveEc2Instances,
	"lambdaFunctions":        inventory.RetrieveLambdaFunctions,
	"vpcs":                   inventory.RetrieveVpcs,
	"securityGroups":         inventory.RetrieveSecurityGroups,
	"internetGateways":       inventory.RetrieveInternetGateways,
	"elasticLoadBalancersV2": inventory.RetrieveElasticLoadBalancersV2,
	"rdsInstances":           inventory.RetrieveRdsInstances,
	"s3Buckets":              inventory.RetrieveS3Buckets,
	"kmsKeys":                inventory.RetrieveKmsKeys,
}

func GetAssetInventory(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if asset category is valid.
		assetCategory := r.URL.Query().Get("asset_category")
		if _, ok := assetCategoryMap[assetCategory]; !ok {
			log.Println("Invalid asset category provided")
			http.Error(w, "Invalid asset category provided provided", 500)
			return
		}

		// Run asset retriever
		results, err := runAssetRetriever(driver, assetCategoryMap[assetCategory])
		if err != nil {
			log.Printf("failed to run asset retriever for %v: %v", assetCategory, err)
			http.Error(w, "failed get asset inventory", 500)
			return
		}
		retDataBytes, err := json.Marshal(results)
		if err != nil {
			log.Printf("failed to marshal %v retriever: %v", assetCategory, err)
			http.Error(w, "failed get asset inventory", 500)
			return
		}
		w.Write(retDataBytes)
	}
}

func runAssetRetriever(driver neo4j.Driver, assetRetriever AssetRetriever) (interface{}, error) {
	session := driver.NewSession(neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeRead,
		DatabaseName: "neo4j",
	})
	defer session.Close()

	return session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
		return assetRetriever(tx)
	})
}
