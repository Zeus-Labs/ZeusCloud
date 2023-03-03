package main

import (
	"log"
	"net/http"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/Zeus-Labs/ZeusCloud/rules"

	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/Zeus-Labs/ZeusCloud/db"
	"github.com/Zeus-Labs/ZeusCloud/handlers"
	"github.com/Zeus-Labs/ZeusCloud/middleware"
)

func main() {
	// Connect with Postgres database
	postgresDb := db.InitPostgres()
	log.Println("Set up postgres db")

	var ruleDataList []models.RuleData
	for _, r := range rules.AttackPathsRulesToExecute {
		rd, err := rules.UpsertRuleData(postgresDb, r, "attackpath")
		if err != nil {
			log.Printf("Unexpected error upserting rule_data %v", err)
			continue
		}
		ruleDataList = append(ruleDataList, rd)
	}

	for _, r := range rules.MisconfigurationRulesToExecute {
		rd, err := rules.UpsertRuleData(postgresDb, r, "misconfiguration")
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
	rulesToExecute := append(append([]types.Rule{}, rules.AttackPathsRulesToExecute...), rules.MisconfigurationRulesToExecute...)
	go control.RuleExecutionLoop(postgresDb, driver, ruleDataList, rulesToExecute)
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
	http.ListenAndServe(":8080", loggedMux)
}
