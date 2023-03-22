package handlers

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/rules/attackpath"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

var ruleGraphMap = map[string]types.Rule{
	"attackpath/private_serverless_admin_permissions":          attackpath.PrivateServerlessAdmin{},
	"attackpath/private_vm_admin_permissions":                  attackpath.PrivateVmAdmin{},
	"attackpath/publicly_exposed_vm_admin_permissions":         attackpath.PubliclyExposedVmAdmin{},
	"attackpath/publicly_exposed_vm_high_permissions":          attackpath.PubliclyExposedVmHigh{},
	"attackpath/publicly_exposed_vm_priv_escalation":           attackpath.PubliclyExposedVmPrivEsc{},
	"attackpath/publicly_exposed_serverless_admin_permissions": attackpath.PubliclyExposedServerlessAdmin{},
	"attackpath/publicly_exposed_serverless_high_permissions":  attackpath.PubliclyExposedServerlessHigh{},
	"attackpath/publicly_exposed_serverless_priv_escalation":   attackpath.PubliclyExposedServerlessPrivEsc{},
	"attackpath/third_party_admin_permissions":                 attackpath.ThirdPartyAdmin{},
	"attackpath/third_party_high_permissions":                  attackpath.ThirdPartyHigh{},
}

func GetRuleGraph(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Entered Get Rule Graph \n")
		resourceId := r.URL.Query().Get("resource")
		ruleId := r.URL.Query().Get("ruleid")

		if _, ok := ruleGraphMap[rule]; !ok {
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
			ruleToCall := ruleGraphMap[rule]
			graphPathResult, err := ruleToCall.ProduceRuleGraph(tx, resourceId)
			if err != nil {
				log.Printf("failed to retrieve rule graph results")
				http.Error(w, "failed to retrieve rule graph results", 500)
				return graphPathResult, err
			}
			ruleToCall.ProduceDisplayGraph(graphPathResult)
			// x, err := ruleToCall.ProduceRuleGraph(tx, resourceId)
			log.Printf("Produce Rule Graph Error %+v", err)
			return graphPathResult, err
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
