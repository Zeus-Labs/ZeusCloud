package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessPrivEsc struct{}

func (PubliclyExposedServerlessPrivEsc) UID() string {
	return "attackpath/publicly_exposed_serverless_priv_escalation"
}

func (PubliclyExposedServerlessPrivEsc) Description() string {
	return "Publicly exposed serverless function with potential privilege escalations."
}

func (PubliclyExposedServerlessPrivEsc) Severity() types.Severity {
	return types.Moderate
}

func (PubliclyExposedServerlessPrivEsc) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
	}
}

func (PubliclyExposedServerlessPrivEsc) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
