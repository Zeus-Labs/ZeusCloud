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
	ProduceRuleGraph(tx neo4j.Transaction, resourceId string) (neo4j.Result, error)
}

// GraphPathResult is a list of paths after compression.
type GraphPathResult struct {
	CompressedPaths []CompressedPath
}

// CompressedPath is a path represented by a list of nodes.
type CompressedPath struct {
	Nodes []Node
}

type Graph struct {
	PathList []Path
}

type Node struct {
	Id     int64                  // Id of this node.
	Labels []string               // Labels attached to this Node.
	Props  map[string]interface{} // Properties of this Node.
}

// Relationship represents a relationship in the neo4j graph database
type Relationship struct {
	Id      int64                  // Identity of this Relationship.
	StartId int64                  // Identity of the start node of this Relationship.
	EndId   int64                  // Identity of the end node of this Relationship.
	Type    string                 // Type of this Relationship.
	Props   map[string]interface{} // Properties of this Relationship.
}

type Path struct {
	Nodes         []Node // All the nodes in the path.
	Relationships []Relationship
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

type DisplayNode struct {
	// Label will tell the type of the node
	NodeLabel string `json:"node_label"`
	// resourceId uniquely identifying the node
	ResourceId int64 `json:"resource_id"`
	// displayId to show in visualization
	DisplayId string `json:"display_id"`
}

type DisplayGraph struct {
	NodeInfo        map[int64]DisplayNode `json:"node_info"`
	AdjacencyList   map[int64][]int64     `json:"adjacency_list"`
	StartingNodeIds []int64               `json:"starting_node_ids"`
}
