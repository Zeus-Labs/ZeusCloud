package processgraph

import (
	"fmt"

	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// CompressNodeBool returns whether we have to compress node boolean.
func CompressNodeBool(node types.Node) bool {

	nodeLabelToSkipMap := map[string]bool{
		"IpPermissionInbound": true,
		"IpRule":              true,
		"NetworkInterface":    true,
	}
	for _, label := range node.Labels {
		_, ok := nodeLabelToSkipMap[label]
		if ok {
			return true
		}
	}
	return false
}

// ProcessGraphPathResult gets a raw neo4j result record and copies the data into
// types.GraphPathResult.
func ProcessGraphPathResult(records neo4j.Result, pathKeyStr string) (types.Graph, error) {

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

			processedPath = append(processedPath, types.Path{
				Nodes:         processedNodesList,
				Relationships: processedRelationshipsList,
			})
			processedGraphPathResult.PathList = append(processedGraphPathResult.PathList, processedPath...)
		}
	}

	return processedGraphPathResult, nil
}

func CompressPaths(graphPaths types.Graph) types.GraphPathResult {

	var CompressedPaths []types.CompressedPath
	for _, path := range graphPaths.PathList {
		var nodesList []types.Node
		for _, node := range path.Nodes {
			// if don't need to compress, add the node to the list of nodes
			if !CompressNodeBool(node) {
				nodesList = append(nodesList, node)
			}
		}

		CompressedPaths = append(CompressedPaths, types.CompressedPath{
			Nodes: nodesList,
		})
	}

	return types.GraphPathResult{
		CompressedPaths: CompressedPaths,
	}
}

func CheckNodeLabel(node types.Node, checkLabel string) bool {
	for _, label := range node.Labels {
		if checkLabel == label {
			return true
		}
	}
	return false
}

// ConvertNodeToDisplayNode converts node from neo4j node to what we
// return to the frontend.
func ConvertNodeToDisplayNode(node types.Node) (types.DisplayNode, error) {
	var displayNodeLabel string
	var displayId string
	nodeProps := node.Props
	if CheckNodeLabel(node, "Instance") || CheckNodeLabel(node, "EC2Instance") {
		displayNodeLabel = "EC2Instance"
		displayId = nodeProps["instanceid"].(string)
	} else if CheckNodeLabel(node, "LoadBalancerV2") {
		displayNodeLabel = "LoadBalancerV2"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "EC2SecurityGroup") {
		displayNodeLabel = "EC2SecurityGroup"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "IpRange") {
		displayNodeLabel = "IpRange"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "AWSRole") && CheckNodeLabel(node, "AWSPrincipal") {
		displayNodeLabel = "AWSRole"
		displayId = nodeProps["arn"].(string)
	} else if CheckNodeLabel(node, "AWSPrincipal") {
		// Could be a root account.
		displayNodeLabel = "AWSPrincipal"
		displayId = nodeProps["arn"].(string)
	} else if CheckNodeLabel(node, "AWSAccount") {
		displayNodeLabel = "AWSAccount"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "AWSLambda") {
		displayNodeLabel = "AWSLambda"
		displayId = nodeProps["id"].(string)
	} else {
		return types.DisplayNode{}, fmt.Errorf("node %+v is unsupported", node)
	}

	return types.DisplayNode{
		NodeLabel:  displayNodeLabel,
		ResourceId: node.Id,
		DisplayId:  displayId,
	}, nil
}

func dfs(
	adjacencyList map[int64][]int64,
	nodeId int64,
	newAdjacencyList map[int64][]int64,
	status map[int64]int,
) {
	status[nodeId] = 1
	for _, adjacentNodeId := range adjacencyList[nodeId] {
		if status[adjacentNodeId] == 0 || status[adjacentNodeId] == 2 {
			newAdjacencyList[nodeId] = append(newAdjacencyList[nodeId], adjacentNodeId)
		}
		if status[adjacentNodeId] == 0 {
			dfs(adjacencyList, adjacentNodeId, newAdjacencyList, status)
		}
	}
	status[nodeId] = 2
}

func removeCycles(adjacencyList map[int64][]int64, startingNodeIds []int64) map[int64][]int64 {
	status := make(map[int64]int)
	newAdjacencyList := make(map[int64][]int64)
	for _, nodeId := range startingNodeIds {
		if status[nodeId] == 0 {
			dfs(adjacencyList, nodeId, newAdjacencyList, status)
		}
	}
	return newAdjacencyList
}

// Assumes you have a valid input of a graph path result.
func ConvertToDisplayGraph(graphPathResult types.GraphPathResult) (types.DisplayGraph, error) {
	if len(graphPathResult.CompressedPaths) == 0 {
		return types.DisplayGraph{}, nil
	}

	// Helper function
	containsIdFunc := func(lst []int64, id int64) bool {
		for _, elem := range lst {
			if elem == id {
				return true
			}
		}
		return false
	}

	// Loop through paths to create graph representation
	nodeInfo := make(map[int64]types.DisplayNode)
	adjacencyList := make(map[int64][]int64)
	startingNodeIds := make([]int64, 0)
	for _, compressedPath := range graphPathResult.CompressedPaths {
		var compressedDisplayNodes []types.DisplayNode
		for _, node := range compressedPath.Nodes {
			convertedNode, err := ConvertNodeToDisplayNode(node)
			if err != nil {
				return types.DisplayGraph{}, err
			}
			compressedDisplayNodes = append(compressedDisplayNodes, convertedNode)
		}

		if len(compressedDisplayNodes) > 0 {
			var candidateId = compressedDisplayNodes[0].ResourceId
			if !containsIdFunc(startingNodeIds, candidateId) {
				startingNodeIds = append(startingNodeIds, candidateId)
			}
		}

		for i, node := range compressedDisplayNodes {
			// Add information of node at position i
			nodeInfo[node.ResourceId] = node

			// Deal with node in the last position
			if i == len(compressedDisplayNodes)-1 {
				break
			}

			// Add i to i + 1 edge to adjacency list
			sourceNodeId := compressedDisplayNodes[i].ResourceId
			targetNodeId := compressedDisplayNodes[i+1].ResourceId
			adjacentNodeIds := adjacencyList[sourceNodeId]
			if !containsIdFunc(adjacentNodeIds, targetNodeId) {
				adjacencyList[sourceNodeId] = append(adjacencyList[sourceNodeId], targetNodeId)
			}
		}
	}

	if len(graphPathResult.CompressedPaths) > 0 && len(graphPathResult.CompressedPaths[0].Nodes) > 0 {
		adjacencyList = removeCycles(adjacencyList, startingNodeIds)
	}

	return types.DisplayGraph{
		NodeInfo:      nodeInfo,
		AdjacencyList: adjacencyList,
	}, nil
}
