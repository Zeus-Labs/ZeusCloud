package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/Zeus-Labs/ZeusCloud/rules"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/Zeus-Labs/ZeusCloud/rules/vulnerability"

	"github.com/Zeus-Labs/ZeusCloud/constants"
	"github.com/Zeus-Labs/ZeusCloud/db"
	"github.com/Zeus-Labs/ZeusCloud/handlers"
	"github.com/Zeus-Labs/ZeusCloud/middleware"
)

const scanStatusInterval = 5 * time.Second

func demoMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if os.Getenv("MODE") == constants.DemoEnvModeStr {
			if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodDelete {
				http.Error(w, "Demo Mode Not Allowed", http.StatusForbidden)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	log.Printf("Mode: %v", os.Getenv("MODE"))

	// Connect with Postgres database
	postgresDb := db.InitPostgres()
	log.Println("Set up postgres db")

	// Connect to neo4j database
	driver := db.InitNeo4j()
	defer driver.Close()
	log.Println("Set up neo4j driver")

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

	// wait till cartography server is started in order for the nuclei templates to get downloaded
	for {
		if _, err := control.GetScanStatus(); err != nil {
			time.Sleep(scanStatusInterval)
			continue
		}
		break
	}
	vriList, err := control.GetVulnRuleInfo()
	if err != nil {
		log.Fatal(err)
	}
	for _, vri := range vriList {
		vulnRule := vulnerability.Vulnerability{
			Name:           vri.Name,
			CveDescription: vri.Description,
			CvssScore:      vri.CvssScore,
			CveIdentifier:  vri.CveIdentifier,
			YamlTemplate:   vri.YamlTemplate,
		}
		rules.VulnerabilityRulesToExecute = append(rules.VulnerabilityRulesToExecute, vulnRule)

		rd, err := rules.UpsertRuleData(postgresDb, vulnRule, "vulnerability")
		if err != nil {
			log.Printf("Unexpected error upserting rule_data %v", err)
			continue
		}
		ruleDataList = append(ruleDataList, rd)
	}

	log.Println("Finished inserting postgres rules.")

	// For demo environment, attempt to add account to kick of cartography.
	if os.Getenv("MODE") == constants.DemoEnvModeStr {
		accountError := handlers.ManualAddAccountDetails(postgresDb, models.AccountDetails{
			AccountName:      "ZeusCloudDemo",
			ConnectionMethod: "profile",
			Profile:          "default",
		})
		if accountError.ErrorCode != 200 || accountError.Error != nil {
			log.Printf("Adding account error %+v", accountError)
		}
	}

	// TODO: Check RulesToExecute have unique names

	// Kick of rule execution loop and try to trigger a scan successfully.
	rulesToExecute := append(append([]types.Rule{}, rules.AttackPathsRulesToExecute...), rules.MisconfigurationRulesToExecute...)
	rulesToExecute = append(rulesToExecute, rules.VulnerabilityRulesToExecute...)
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
	mux.HandleFunc("/api/getAwsProfiles", handlers.GetAwsProfiles())
	mux.HandleFunc("/api/addAccountDetails", handlers.AddAccountDetails(postgresDb))
	mux.HandleFunc("/api/deleteAccountDetails", handlers.DeleteAccountDetails(postgresDb))
	mux.HandleFunc("/api/getAccountDetails", handlers.GetAccountDetails(postgresDb))
	mux.HandleFunc("/api/rescan", handlers.Rescan(postgresDb))
	mux.HandleFunc("/api/getAccountScanInfo", handlers.GetAccountScanInfo())
	mux.HandleFunc("/api/getAssetInventory", handlers.GetAssetInventory(driver))
	mux.HandleFunc("/api/getExploreAssets", handlers.GetExploreAssets(driver))
	mux.HandleFunc("/api/getRuleGraph", handlers.GetRuleGraph(driver))
	mux.HandleFunc("/api/getAccessExplorerGraph", handlers.GetAccessExplorerGraph(driver))
	mux.HandleFunc("/api/getEdgeInfo", handlers.GetEdgeInfo(driver))

	log.Printf("serving on 8080...")
	dLog := log.Default()
	lm := middleware.LoggingMiddleware(dLog)
	loggedMux := lm(mux)
	demoCorsLoggedMux := demoMiddleware(loggedMux)
	http.ListenAndServe(":8080", demoCorsLoggedMux)
}
