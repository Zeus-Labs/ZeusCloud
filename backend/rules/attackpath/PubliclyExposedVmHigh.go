package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedVmHigh struct{}

func (PubliclyExposedVmHigh) UID() string {
	return "attackpath/publicly_exposed_vm_high_permissions"
}

func (PubliclyExposedVmHigh) Description() string {
	return "Publicly exposed VM instance with high permissions."
}

func (PubliclyExposedVmHigh) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedVmHigh) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (PubliclyExposedVmHigh) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
