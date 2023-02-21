package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedVmAdmin struct{}

func (PubliclyExposedVmAdmin) UID() string {
	return "attackpath/publicly_exposed_vm_admin_permissions"
}

func (PubliclyExposedVmAdmin) Description() string {
	return "Publicly exposed VM instance with effective admin permissions."
}

func (PubliclyExposedVmAdmin) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedVmAdmin) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (PubliclyExposedVmAdmin) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
