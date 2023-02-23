package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessAdmin struct{}

func (PubliclyExposedServerlessAdmin) UID() string {
	return "attackpath/publicly_exposed_serverless_admin_permissions"
}

func (PubliclyExposedServerlessAdmin) Description() string {
	return "Publicly exposed serverless function with effective admin permissions."
}

func (PubliclyExposedServerlessAdmin) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedServerlessAdmin) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
		types.IamMisconfiguration,
	}
}

func (PubliclyExposedServerlessAdmin) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
