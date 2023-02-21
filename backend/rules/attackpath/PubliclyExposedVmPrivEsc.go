package attackpath

import (
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PubliclyExposedVmPrivEsc struct{}

func (PubliclyExposedVmPrivEsc) UID() string {
	return "attackpath/publicly_exposed_vm_priv_escalation"
}

func (PubliclyExposedVmPrivEsc) Description() string {
	return "Publicly exposed VM instance with potential privilege escalations."
}

func (PubliclyExposedVmPrivEsc) Severity() types.Severity {
	return types.Critical
}

func (PubliclyExposedVmPrivEsc) RiskCategories() types.RiskCategoryList {
	return []types.RiskCategory{
		types.PubliclyExposed,
	}
}

func (PubliclyExposedVmPrivEsc) Execute(tx neo4j.Transaction) ([]types.Result, error) {
	var results []types.Result
	return results, nil
}
