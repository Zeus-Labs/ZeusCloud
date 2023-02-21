package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/Zeus-Labs/ZeusCloud/rules"

	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/Zeus-Labs/ZeusCloud/db"
	"github.com/Zeus-Labs/ZeusCloud/handlers"
	"github.com/Zeus-Labs/ZeusCloud/middleware"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(response http.ResponseWriter, r *http.Request) {
		// Allow requests coming from browser.
		response.Header().Set("Access-Control-Allow-Origin", os.Getenv("WEBSITE_DOMAIN"))
		response.Header().Set("Access-Control-Allow-Credentials", "true")
		response.Header().Set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers")

		if r.Method == "OPTIONS" {
			// we add content-type + other headers used by SuperTokens
			response.Header().Set("Access-Control-Allow-Methods", "*")
			response.Write([]byte(""))
		} else {
			next.ServeHTTP(response, r)
		}
	})
}

func main() {
	// Connect with Postgres database
	postgresDb := db.InitPostgres()
	log.Println("Set up postgres db")

	var ruleDataList []models.RuleData
	for _, r := range rules.RulesToExecute {
		rd, err := rules.UpsertRuleData(postgresDb, r)
		if err != nil {
			log.Printf("Unexpected error upserting rule_data %v", err)
			continue
		}
		ruleDataList = append(ruleDataList, rd)
	}
	log.Println("Finished inserting postgres rules.")

	// Connect to neo4j database
	driver := db.InitNeo4j()
	defer driver.Close()
	log.Println("Set up neo4j driver")

	// TODO: Check RulesToExecute have unique names

	// Kick of rule execution loop and try to trigger a scan successfully.
	go control.RuleExecutionLoop(postgresDb, driver, ruleDataList)
	if err := control.TriggerScan(postgresDb); err != nil {
		log.Printf("Tried triggering scan but failed: %v", err)
	}

	log.Println("Completed triggering scan.")

	// Set up routing
	mux := http.NewServeMux()
	mux.HandleFunc("/api/getRules", handlers.GetRules(postgresDb))
	mux.HandleFunc("/api/toggleRuleActive", handlers.ToggleRuleActive(postgresDb))
	mux.HandleFunc("/api/getAllAlerts", handlers.GetAllAlerts(postgresDb))
	mux.HandleFunc("/api/toggleAlertMuted", handlers.ToggleAlertMuted(postgresDb))
	mux.HandleFunc("/api/getComplianceFramework", handlers.GetComplianceFramework(postgresDb))
	mux.HandleFunc("/api/getComplianceFrameworkStats", handlers.GetComplianceFrameworkStats(postgresDb))
	mux.HandleFunc("/api/addAccountDetails", handlers.AddAccountDetails(postgresDb))
	mux.HandleFunc("/api/deleteAccountDetails", handlers.DeleteAccountDetails(postgresDb))
	mux.HandleFunc("/api/getAccountDetails", handlers.GetAccountDetails(postgresDb))
	mux.HandleFunc("/api/rescan", handlers.Rescan(postgresDb))
	mux.HandleFunc("/api/isScanRunning", handlers.IsScanRunning())

	log.Printf("serving on 8080...")
	dLog := log.Default()
	lm := middleware.LoggingMiddleware(dLog)
	loggedMux := lm(mux)
	corsMiddlewareLoggedMux := corsMiddleware(loggedMux)
	http.ListenAndServe(":8080", corsMiddlewareLoggedMux)
}
