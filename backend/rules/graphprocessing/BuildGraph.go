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
			dg.AdjList[ipRangeNode.Id] = append(dg.AdjList[ipRangeNode.Id], sgNode)
			dg.AdjList[sgNode.Id] = append(dg.AdjList[sgNode.Id], computeNode)
		}
	}
}

// Returns boolean if the ip range, security group, and compute
// node. Used in patterns of indirect exposure of compute.
func extractIpRangeSecurityGroupLoadBalancerCompute(dg *types.DisplayGraph,
	path types.Path, computeLabel string) (bool, []types.Node) {
	finalNodeList := []types.Node{}

	var ipRangeNode types.Node
	var securityGroupNode types.Node
	var loadbalancerNode types.Node
	var computeNode types.Node

	loadBalancerToComputeRelationship := false
	loadBalancerToSecurityGroupRelationship := false
	ipRangeToSecurityGroupRelationship := false

	for _, relationship := range path.Relationships {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := dg.NodeIdToNodeMap[startNodeId]
		endNode := dg.NodeIdToNodeMap[endNodeId]

		if edgeType == "EXPOSE" {
			if CheckNodeLabel(startNode, "LoadBalancerV2") && CheckNodeLabel(endNode, computeLabel) {
				loadBalancerToComputeRelationship = true
				loadbalancerNode = startNode
				computeNode = endNode
			}
		}

		if edgeType == "MEMBER_OF_EC2_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "LoadBalancerV2") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				loadBalancerToSecurityGroupRelationship = true
				loadbalancerNode = startNode
				securityGroupNode = endNode
			}
		}

		if edgeType == "IP_RANGE_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "IpRange") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				ipRangeToSecurityGroupRelationship = true
				ipRangeNode = startNode
				securityGroupNode = endNode
			}
		}
	}
	if !loadBalancerToComputeRelationship || !loadBalancerToSecurityGroupRelationship ||
		!ipRangeToSecurityGroupRelationship {
		return false, finalNodeList
	}
	finalNodeList = append(finalNodeList, ipRangeNode, securityGroupNode, loadbalancerNode, computeNode)
	return true, finalNodeList
}

func BuildAdjListIndirectSecurityGroupToCompute(dg *types.DisplayGraph, gp types.GraphPathResult,
	computeLabel string) {

	pathResult := gp.PathResult

	// Check for ip range to ec2 security group to ec2.
	for _, path := range pathResult {
		patternExists, nodeList := extractIpRangeSecurityGroupLoadBalancerCompute(dg,
			path, computeLabel)

		// pRangeNode, securityGroupNode, loadbalancerNode, computeNode
		ipRangeNode := nodeList[0]
		securityGroupNode := nodeList[1]
		loadBalancerNode := nodeList[2]
		computeNode := nodeList[3]
		if patternExists {
			dg.AdjList[ipRangeNode.Id] = append(dg.AdjList[ipRangeNode.Id], securityGroupNode)
			dg.AdjList[securityGroupNode.Id] = append(dg.AdjList[securityGroupNode.Id], loadBalancerNode)
			dg.AdjList[loadBalancerNode.Id] = append(dg.AdjList[securityGroupNode.Id], computeNode)
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
	for _, node := range ipRangeNodeMap {
		dg.StartNodeList = append(dg.StartNodeList, node)
	}

	// Builds out adj list of ip range, security group, to compute.
	BuildAdjListDirectSecurityGroupToCompute(dg, gp, computeLabel)

	// Build out adj list of ip range, security group, load balancer in front of compute.
	BuildAdjListIndirectSecurityGroupToCompute(dg, gp, computeLabel)
}

// Returns boolean if compute can assume role (or if there's a chain).
// Returns the compute node and then a list of the roles that can be assumed
// in the order of assumption.
func extractComputeAssumeRoles(dg *types.DisplayGraph,
	path types.Path, computeLabel string) (bool, []types.Node) {

	// Chain of start node and the role it can assume
	assumeRoleChainMap := make(map[int64]int64)

	var finalNodeList []types.Node

	var computeNode types.Node
	var computeNodeFound bool
	for _, node := range path.Nodes {
		if CheckNodeLabel(node, computeLabel) {
			computeNodeFound = true
			computeNode = node
			break
		}
	}

	// Return if no compute node was found in path.
	if !computeNodeFound {
		return false, finalNodeList
	}

	// Check that the path is filled with assume role chains.
	for _, relationship := range path.Relationships {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := dg.NodeIdToNodeMap[startNodeId]
		endNode := dg.NodeIdToNodeMap[endNodeId]
		if edgeType != "STS_ASSUME_ROLE_ALLOW" {
			return false, finalNodeList
		}

		if CheckNodeLabel(startNode, computeLabel) && CheckNodeLabel(endNode, "AWSRole") {
			computeNode = startNode
			assumeRoleChainMap[computeNode.Id] = endNode.Id
		}

		if CheckNodeLabel(startNode, "AWSRole") && CheckNodeLabel(endNode, "AWSRole") {
			assumeRoleChainMap[startNode.Id] = endNode.Id
		}
	}

	// Go through map and build list.
	finalNodeList = append(finalNodeList, computeNode)
	nodeNotInMap := true
	//startNode := computeNode
	//var nodeToAdd types.Node
	for nodeNotInMap {
		//endNode := assumeRoleChainMap[startNode.Id]
		//finalNodeList = append(finalNodeList, )
		// TODO:
	}

	return true, finalNodeList
}

func BuildAdjListComputeWithAssumeRoles(dg *types.DisplayGraph, gp types.GraphPathResult,
	computeLabel string) {

	//pathResult := gp.PathResult

}
