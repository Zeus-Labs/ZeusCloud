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

// GraphStartNodeCheck does a quick check that the labels of the first nodes
// of every path match. Returns the paths that may not match the first nodes
// labels.
func GraphStartNodeCheck(graphPaths types.Graph) (
	bool, []types.Path) {
	pathResult := graphPaths.PathList

	var incorrectPaths []types.Path
	if len(pathResult) <= 1 {
		return true, incorrectPaths
	}

	// Extract the first nodes labels.
	var startNodesLabels []string
	for idx := 0; idx < len(pathResult); idx++ {
		nodesList := pathResult[idx].Nodes
		if len(nodesList) > 0 {
			startNodesLabels = nodesList[0].Labels
			break
		}
	}

	for _, path := range pathResult {
		if len(path.Nodes) > 0 {
			node := path.Nodes[0]
			for _, startNodesLabel := range startNodesLabels {
				if !CheckNodeLabel(node, startNodesLabel) {
					incorrectPaths = append(incorrectPaths, path)
					break
				}
			}
		}
	}

	if len(incorrectPaths) > 0 {
		return false, incorrectPaths
	}
	return true, incorrectPaths
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

// ConvertNodeToDisplayNode converts node from neo4 node to what we
// return to the frontend.
func ConvertNodeToDisplayNode(node types.Node) (types.DisplayNode, error) {
	displayNodeLabel := "No Label"
	displayId := "No Display Id"
	nodeProps := node.Props

	if CheckNodeLabel(node, "Instance") || CheckNodeLabel(node, "EC2Instance") {
		displayNodeLabel = "EC2 Instance"
		displayId = nodeProps["instanceid"].(string)
	} else if CheckNodeLabel(node, "LoadBalancerV2") {
		displayNodeLabel = "Load Balancer"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "EC2SecurityGroup") {
		displayNodeLabel = "Security Group"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "IpRange") {
		displayNodeLabel = "Ip Range"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "AWSRole") && CheckNodeLabel(node, "AWSPrincipal") {
		displayNodeLabel = "AWS Role"
		displayId = nodeProps["arn"].(string)
	} else if CheckNodeLabel(node, "AWSPrincipal") {
		// Could be a root account.
		displayNodeLabel = "AWS Principal"
		displayId = nodeProps["arn"].(string)
	} else if CheckNodeLabel(node, "AWSAccount") {
		displayNodeLabel = "AWS Account"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "AWSLambda") {
		displayNodeLabel = "AWS Lambda"
		displayId = nodeProps["id"].(string)
	} else {
		return types.DisplayNode{}, fmt.Errorf("Node %+v is unsupported", node)
	}

	return types.DisplayNode{
		NodeLabel:  displayNodeLabel,
		ResourceId: node.Id,
		DisplayId:  displayId,
	}, nil
}

// Assumes you have a valid input of a graph path result.
func ConvertToDisplayGraph(graphPathResult types.GraphPathResult) (types.DisplayGraph,
	error) {
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
	for _, compressedPath := range graphPathResult.CompressedPaths {
		var compressedDisplayNodes []types.DisplayNode
		isLeftPath := false
		for _, node := range compressedPath.Nodes {
			if CheckNodeLabel(node, "IpRange") {
				isLeftPath = true
			}
			convertedNode, err := ConvertNodeToDisplayNode(node)
			if err != nil {
				return types.DisplayGraph{}, err
			}
			compressedDisplayNodes = append(compressedDisplayNodes, convertedNode)
		}

		for i, node := range compressedDisplayNodes {
			// Add information of node at position i
			nodeInfo[node.ResourceId] = node

			// Deal with node in the last position
			if i == len(compressedDisplayNodes)-1 {
				break
			}

			// Add i to i + 1 edge to adjacency list
			var sourceNodeId int64
			var targetNodeId int64
			if isLeftPath {
				sourceNodeId = compressedDisplayNodes[i+1].ResourceId
				targetNodeId = compressedDisplayNodes[i].ResourceId
			} else {
				sourceNodeId = compressedDisplayNodes[i].ResourceId
				targetNodeId = compressedDisplayNodes[i+1].ResourceId
			}
			adjacentNodeIds := adjacencyList[sourceNodeId]
			if !containsIdFunc(adjacentNodeIds, targetNodeId) {
				adjacencyList[sourceNodeId] = append(adjacencyList[sourceNodeId], targetNodeId)
			}
		}
	}

	return types.DisplayGraph{
		NodeInfo:      nodeInfo,
		AdjacencyList: adjacencyList,
	}, nil
}
