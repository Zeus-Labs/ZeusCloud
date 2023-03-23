package processgraph

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// ProcessGraphPathResult gets a raw neo4j result record and copies the data into
// types.GraphPathResult.
func ProcessGraphPathResult(records neo4j.Result, pathKeyStr string) (types.Graph, error) {
	fmt.Printf("START of  ProcessGraphPathResult \n")

	// Holds the list of paths that are processed.
	var processedGraphPathResult types.Graph

	for records.Next() {
		record := records.Record()
		paths, ok := record.Get(pathKeyStr)
		if !ok {
			return types.Graph{}, fmt.Errorf("Failed to get record.")
		}

		pathsList, ok := paths.([]interface{})
		if !ok {
			return types.Graph{}, fmt.Errorf("Failed to cast to list of interfaces of paths")
		}

		for _, path := range pathsList {
			// Cast path
			resultGraphPath, pathCastSuccessful := path.(neo4j.Path)
			var processedPath []types.Path
			var processedNodesList []types.Node
			var processedRelationshipsList []types.Relationship

			if !pathCastSuccessful {
				return types.Graph{}, fmt.Errorf("Failed to retrieve graph path")
			}

			for _, node := range resultGraphPath.Nodes {
				processedNodesList = append(processedNodesList, types.Node{
					Id:     node.Id,
					Labels: node.Labels,
					Props:  node.Props,
				})
			}

			for _, relationship := range resultGraphPath.Relationships {
				processedRelationshipsList = append(processedRelationshipsList, types.Relationship{
					Id:      relationship.Id,
					StartId: relationship.StartId,
					EndId:   relationship.EndId,
					Type:    relationship.Type,
					Props:   relationship.Props,
				})
			}

			fmt.Printf("Processed Nodes List %+v \n", processedNodesList)
			fmt.Printf("Processed Relationships List %+v \n", processedRelationshipsList)
			processedPath = append(processedPath, types.Path{
				Nodes:         processedNodesList,
				Relationships: processedRelationshipsList,
			})
			processedGraphPathResult.PathResult = append(processedGraphPathResult.PathResult, processedPath...)
		}
	}

	return processedGraphPathResult, nil
}

// Returns boolean if the paths check passes and returns which paths may be
// incorrect.
func PathsResultCheck(graphPathResult types.Graph, resourceId string) (
	bool, []types.Path) {
	pathResult := graphPathResult.PathResult

	var incorrectPaths []types.Path
	// Check that every
	for _, path := range pathResult {
		if len(path.Nodes) > 0 {
			node := path.Nodes[0]
			nodeStr := (node.Props["id"]).(string)
			if nodeStr != resourceId {
				incorrectPaths = append(incorrectPaths, path)
			}
		}
	}

	if len(incorrectPaths) > 0 {
		return false, incorrectPaths
	}
	return true, incorrectPaths
}
