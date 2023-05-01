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
		// Attempt to match the edges. This is a best effort match where we
		// try to find an edge connecting node i and i+1 together.
		var edgesList []*types.EdgeInfo
		for i := range nodesList {
			if i == len(nodesList)-1 {
				break
			}
			idA := nodesList[i].Id
			idB := nodesList[i+1].Id
			var ei *types.EdgeInfo
			for _, relationship := range path.Relationships {
				if (relationship.StartId == idA && relationship.EndId == idB) ||
					(relationship.StartId == idB && relationship.EndId == idA) {
					ei = &types.EdgeInfo{
						Id:   relationship.Id,
						Type: relationship.Type,
					}
					break
				}
			}
			edgesList = append(edgesList, ei)
		}

		CompressedPaths = append(CompressedPaths, types.CompressedPath{
			Nodes: nodesList,
			Edges: edgesList,
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
	} else if CheckNodeLabel(node, "AWSUser") && CheckNodeLabel(node, "AWSPrincipal") {
		displayNodeLabel = "AWSUser"
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
	} else if CheckNodeLabel(node, "AWSEffectiveAdmin") {
		displayNodeLabel = "AWSEffectiveAdmin"
		displayId = nodeProps["id"].(string)
	} else if CheckNodeLabel(node, "GenericAwsAccount") {
		displayNodeLabel = "GenericAwsAccount"
		displayId = "Generic AWS Account"
	} else if CheckNodeLabel(node, "S3Bucket") {
		displayNodeLabel = "S3Bucket"
		displayId = nodeProps["name"].(string)
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
	adjacencyList map[int64][]types.DisplayEdge,
	nodeId int64,
	newAdjacencyList map[int64][]types.DisplayEdge,
	status map[int64]int,
) {
	status[nodeId] = 1
	for _, adjacentEdge := range adjacencyList[nodeId] {
		if status[adjacentEdge.TargetResourceId] == 0 || status[adjacentEdge.TargetResourceId] == 2 {
			newAdjacencyList[nodeId] = append(newAdjacencyList[nodeId], adjacentEdge)
		}
		if status[adjacentEdge.TargetResourceId] == 0 {
			dfs(adjacencyList, adjacentEdge.TargetResourceId, newAdjacencyList, status)
		}
	}
	status[nodeId] = 2
}

func removeCycles(adjacencyList map[int64][]types.DisplayEdge, startingNodeIds []int64) map[int64][]types.DisplayEdge {
	if adjacencyList == nil {
		return nil
	}
	status := make(map[int64]int)
	newAdjacencyList := make(map[int64][]types.DisplayEdge)
	for _, nodeId := range startingNodeIds {
		if status[nodeId] == 0 {
			dfs(adjacencyList, nodeId, newAdjacencyList, status)
		}
	}
	return newAdjacencyList
}

// Helper function to check if node id is contained in nodeIdLst
func nodeIdLstContainsId(nodeIdLst []int64, id int64) bool {
	for _, nodeId := range nodeIdLst {
		if nodeId == id {
			return true
		}
	}
	return false
}

// Helper function to check if node id is contained in edgesLst
func edgesLstContainsNodeId(edgesLst []types.DisplayEdge, id int64) bool {
	for _, edge := range edgesLst {
		if edge.TargetResourceId == id {
			return true
		}
	}
	return false
}

// Assumes you have a valid input of a graph path result.
func ConvertToDisplayGraph(graphPathResult types.GraphPathResult) (types.DisplayGraph, error) {
	if len(graphPathResult.CompressedPaths) == 0 {
		return types.DisplayGraph{}, nil
	}

	// Loop through paths to create graph representation
	nodeInfo := make(map[int64]types.DisplayNode)
	adjacencyList := make(map[int64][]types.DisplayEdge)
	startingNodeIds := make([]int64, 0)
	for _, compressedPath := range graphPathResult.CompressedPaths {
		// Create displayNodes list
		var displayNodes []types.DisplayNode
		for _, node := range compressedPath.Nodes {
			convertedNode, err := ConvertNodeToDisplayNode(node)
			if err != nil {
				return types.DisplayGraph{}, fmt.Errorf("Failure to convert display node %v", err)
			}
			displayNodes = append(displayNodes, convertedNode)
		}

		// Prepare startingNodeIds
		if len(displayNodes) > 0 {
			var candidateId = displayNodes[0].ResourceId
			if !nodeIdLstContainsId(startingNodeIds, candidateId) {
				startingNodeIds = append(startingNodeIds, candidateId)
			}
		}

		// Create displayEdges list
		var displayEdges []types.DisplayEdge
		for i, edge := range compressedPath.Edges {
			var id *int64
			var makeDotted *bool
			if edge != nil {
				id = &edge.Id
				makeDottedBool := edge.Type == "PRIVILEGE_ESCALATION"
				makeDotted = &makeDottedBool
			}
			displayEdges = append(displayEdges, types.DisplayEdge{
				SourceResourceId: displayNodes[i].ResourceId,
				TargetResourceId: displayNodes[i+1].ResourceId,
				Id:               id,
				MakeDotted:       makeDotted,
			})
		}

		// Prepare nodeInfo
		for _, node := range displayNodes {
			nodeInfo[node.ResourceId] = node
		}

		// Prepare adjacencyList
		for _, edge := range displayEdges {
			adjacentEdges := adjacencyList[edge.SourceResourceId]
			if !edgesLstContainsNodeId(adjacentEdges, edge.TargetResourceId) {
				adjacencyList[edge.SourceResourceId] = append(adjacencyList[edge.SourceResourceId], edge)
			}
		}
	}

	adjacencyList = removeCycles(adjacencyList, startingNodeIds)

	return types.DisplayGraph{
		NodeInfo:      nodeInfo,
		AdjacencyList: adjacencyList,
	}, nil
}
