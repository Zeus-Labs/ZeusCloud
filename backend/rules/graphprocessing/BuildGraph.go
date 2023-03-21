package graphprocessing

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
)

func PrintAdjList(dg *types.DisplayGraph) {
	for nodeId, nodeList := range dg.AdjList {
		fmt.Printf("Node Id: %+v \n", nodeId)
		for _, node := range nodeList {
			fmt.Printf("Node %+v \n", node)
		}
	}
}

// Returns boolean of if the ip range, security group, and compute
// node.
func extractIpRangeSecurityGroupCompute(dg *types.DisplayGraph,
	path types.Path, computeLabel string) (bool,
	types.Node, types.Node, types.Node) {

	var ipRangeNode types.Node
	var securityGroupNode types.Node
	var computeNode types.Node

	computeToSgEdge := false
	ipRangeToSgEdge := false
	for _, relationship := range path.Relationships {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := dg.NodeIdToNodeMap[startNodeId]
		endNode := dg.NodeIdToNodeMap[endNodeId]
		if edgeType == "MEMBER_OF_EC2_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, computeLabel) && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				computeToSgEdge = true
				computeNode = startNode
				securityGroupNode = endNode
			}
		}

		if edgeType == "IP_RANGE_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "IpRange") && CheckNodeLabel(endNode,
				"EC2SecurityGroup") {
				ipRangeToSgEdge = true
				ipRangeNode = startNode
			}

		}
	}

	if !computeToSgEdge || !ipRangeToSgEdge {
		return false, types.Node{}, types.Node{}, types.Node{}
	}
	return true, ipRangeNode, securityGroupNode, computeNode
}

func BuildAdjListDirectSecurityGroupToCompute(dg *types.DisplayGraph, gp types.GraphPathResult,
	computeLabel string) {
	// Get list of exposed ip ranges and build from there.
	pathResult := gp.PathResult

	// Check for ip range to ec2 security group to ec2.

	for _, path := range pathResult {
		patternExists, ipRangeNode, sgNode, computeNode := extractIpRangeSecurityGroupCompute(dg,
			path, computeLabel)
		if patternExists {
			dg.AdjList[]
		}
	}
}

// Builds Adj List: Manages Networking in front of Compute (Both direct sg exposure
// and elb indirect exposure)
func BuildAdjListSecurityGroupToCompute(dg *types.DisplayGraph, gp types.GraphPathResult,
	computeLabel string) {

	pathResult := gp.PathResult

	// Find the ip range - these are the external facing nodes.
	ipRangeNodeMap := make(map[int64]types.Node)
	for _, path := range pathResult {
		for _, node := range path.Nodes {
			if CheckNodeLabel(node, "IpRange") {
				ipRangeNodeMap[node.Id] = node
			}
		}
	}

	// Populate the start node list.
	for nodeId, node := range ipRangeNodeMap {
		dg.StartNodeList = append(dg.StartNodeList, node)
	}

	// Build out

}
