package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/inventory"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type ExploreAsset struct {
	Id         string `json:"id"`
	Account_id string `json:"account_id"`
	Category   string `json:"category"`
}

var exploreAssetCategory = []string{"iamUsers",
	"iamRoles",
	"s3Buckets",
	"ec2Instances"}

func GetExploreAssets(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		exploreAssets := []ExploreAsset{}

		// Run asset retriever
		for _, asset := range exploreAssetCategory {
			results, err := runAssetRetriever(driver, assetCategoryMap[asset])
			if err != nil {
				log.Printf("failed to run asset retriever for %v: %v", asset, err)
				http.Error(w, "failed get explore assets", 500)
				return
			}
			// appending individual assets objects to the explore assets slice
			resultsSlice, ok := results.([]interface{})
			if ok {
				for _, obj := range resultsSlice {
					exploreAsset := ExploreAsset{Category: asset}
					switch asset {
					case "iamUsers":
						iamUser, ok := obj.(inventory.IamUser)
						if ok {
							exploreAsset.Id = *iamUser.Arn
							exploreAsset.Account_id = *iamUser.AccountId
						}
					case "iamRoles":
						iamRole, ok := obj.(inventory.IamRole)
						if ok {
							exploreAsset.Id = *iamRole.Arn
							exploreAsset.Account_id = *iamRole.AccountId
						}
					case "s3Buckets":
						s3, ok := obj.(inventory.S3Bucket)
						if ok {
							exploreAsset.Id = *s3.Name
							exploreAsset.Account_id = *s3.AccountId
						}
					case "ec2Instances":
						ec2, ok := obj.(inventory.Ec2Instance)
						if ok {
							exploreAsset.Id = *ec2.InstancdId
							exploreAsset.Account_id = *ec2.AccountId
						}

					}

					exploreAssets = append(exploreAssets, exploreAsset)
				}
			}
		}
		retDataBytes, err := json.Marshal(exploreAssets)
		if err != nil {
			log.Printf("failed to marshal explore assets: %v", err)
			http.Error(w, "failed get explore assets", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
