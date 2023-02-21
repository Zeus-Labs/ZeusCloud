package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedServerlessHigh struct{}

func (PubliclyExposedServerlessHigh) UID() string {
	return "attackpath/publicly_exposed_vm_high_permissions"
}

func (PubliclyExposedServerlessHigh) Description() string {
	return "Publicly exposed VM instance with high permissions."
}

func (PubliclyExposedServerlessHigh) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedServerlessHigh) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (PubliclyExposedServerlessHigh) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
