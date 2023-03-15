package handlers

import (
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
	"log"
	"net/http"
)

var ruleGraphCategoryMap = map[string]AssetRetriever{
	"iamUser":  inventory.RetrieveIamUsers,
	"iamGroup": inventory.RetrieveIamGroups,
	"iamRole":  inventory.RetrieveIamRoles,
}

func GetRuleGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check if asset category is valid.
		assetCategory := r.URL.Query().Get("asset_category")
		if _, ok := assetCategoryMap[assetCategory]; !ok {
			log.Println("Invalid asset category provided")
			http.Error(w, "Invalid asset category provided provided", 500)
			return
		}

	}
}
