package types

import (
	"github.com/lib/pq"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type Rule interface {
	UID() string                                    // Unique Identifier of rule
	Description() string                            // Longer text description of rule
	Severity() Severity                             // Severity level of the rule
	RiskCategories() RiskCategoryList               // Risk categories the rule fits into
	Execute(tx neo4j.Transaction) ([]Result, error) // Execution logic of rule
}

type Result struct {
	ResourceID   string
	ResourceType string
	AccountID    string
	Status       string
	Context      string
}

type Severity string

const (
	Critical Severity = "Critical"
	High     Severity = "High"
	Moderate Severity = "Moderate"
	Low      Severity = "Low"
)

type RiskCategory string

const (
	InsufficientMonitoring RiskCategory = "Insufficient Monitoring"
	PubliclyExposed        RiskCategory = "Publicly Exposed"
	PoorEncryption         RiskCategory = "Poor Encryption"
	IamMisconfiguration    RiskCategory = "IAM Misconfiguration"
	Patching               RiskCategory = "Patching Issue"
	UnusedResource         RiskCategory = "Unused Resource"
	DataAccess             RiskCategory = "Data Access"
	PoorBackup             RiskCategory = "Poor Backup"
)

type RiskCategoryList []RiskCategory

func (rcl RiskCategoryList) AsStringArray() pq.StringArray {
	var categories []string
	for _, c := range rcl {
		categories = append(categories, string(c))
	}
	return pq.StringArray(categories)
}
