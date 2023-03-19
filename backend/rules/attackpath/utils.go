package attackpath

import (
	"fmt"
	"github.com/Zeus-Labs/ZeusCloud/rules/types"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

// ProcessGraphPathResult gets a raw neo4j result record.
func ProcessGraphPathResult(records neo4j.Result, pathKeyStr string) (types.GraphPathResult, error) {
	fmt.Printf("START of  ProcessGraphPathResult \n")

	// Holds the list of paths that are processed.
	var processedGraphPathResult types.GraphPathResult
	var processedPath []types.Path
	for records.Next() {
		record := records.Record()
		paths, ok := record.Get(pathKeyStr)
		if !ok {
			return types.GraphPathResult{}, fmt.Errorf("Failed to get record.")
		}

		pathsList, ok := paths.([]interface{})
		if !ok {
			return types.GraphPathResult{}, fmt.Errorf("Failed to cast to list of interfaces of paths")
		}

		var processedNodesList []types.Node
		var processedRelationshipsList []types.Relationship
		for _, path := range pathsList {
			// Cast path
			resultGraphPath, pathCastSuccessful := path.(neo4j.Path)
			if !pathCastSuccessful {
				return types.GraphPathResult{}, fmt.Errorf("Failed to retrieve graph path")
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
		}
	}

	processedGraphPathResult.PathResult = append(processedGraphPathResult.PathResult, processedPath...)
	return processedGraphPathResult, nil
}

func CheckNodeLabel(node types.Node, checkLabel string) bool {
	for _, label := range node.Labels {
		if checkLabel == label {
			return true
		}
	}
	return false
}

// (:IpRange{range:'0.0.0.0/0'})-[:MEMBER_OF_IP_RULE]->
//
//	(perm:IpPermissionInbound)-[:MEMBER_OF_EC2_SECURITY_GROUP]->
//	(elbv2_group:EC2SecurityGroup)<-[:MEMBER_OF_EC2_SECURITY_GROUP]-
//	(elbv2:LoadBalancerV2{scheme: 'internet-facing'})—[:ELBV2_LISTENER]->
//	(listener:ELBV2Listener)
//
// Returns if pattern is met, returns a path: elbv2_group (security group), elbv2 (load balancer), and relationship.
func CheckElbSecurityGroupPattern(path types.Path) (bool, types.Path) {

	nodeIdToNodeMap := make(map[int64]types.Node)
	for _, node := range path.Nodes {
		nodeIdToNodeMap[node.Id] = node
	}

	ipRangeToIpRuleEdge := false
	ipRuleToElbV2SecurityGroupEdge := false
	loadBalancerToElbV2SecurityGroupEdge := false
	loadBalancerToElbV2Listener := false

	var elbv2SecurityGroupNode types.Node
	var elbv2Node types.Node
	var elbv2ToSecurityGroupRelationship types.Relationship

	for _, relationship := range path.Relationships {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := nodeIdToNodeMap[startNodeId]
		endNode := nodeIdToNodeMap[endNodeId]

		if edgeType == "MEMBER_OF_IP_RULE" {
			if CheckNodeLabel(startNode, "IpRange") && CheckNodeLabel(endNode, "IpRule") {
				ipRangeToIpRuleEdge = true
			}
		}

		if edgeType == "MEMBER_OF_EC2_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "IpRule") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				ipRuleToElbV2SecurityGroupEdge = true
			}

			if CheckNodeLabel(startNode, "LoadBalancerV2") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				loadBalancerToElbV2SecurityGroupEdge = true

				elbv2Node = startNode
				elbv2SecurityGroupNode = endNode
				elbv2ToSecurityGroupRelationship = relationship
			}
		}

		if edgeType == "ELBV2_LISTENER" {
			if CheckNodeLabel(startNode, "LoadBalancerV2") && CheckNodeLabel(endNode, "ELBV2Listener") {
				loadBalancerToElbV2Listener = true
			}
		}
	}

	// if any of those edges are false, return path empty.
	if !ipRangeToIpRuleEdge || !ipRuleToElbV2SecurityGroupEdge || !loadBalancerToElbV2SecurityGroupEdge ||
		!loadBalancerToElbV2Listener {
		return false, types.Path{}
	}

	return true, types.Path{
		Nodes:         []types.Node{elbv2Node, elbv2SecurityGroupNode},
		Relationships: []types.Relationship{elbv2ToSecurityGroupRelationship},
	}
}

// Returns if we have (elbv2)-[:EXPOSE]->(e) and gives the ec2 instance node.
// func CheckElbV2ExposesVMPattern(path types.Path) (bool, types.Node) {

// }

func ProcessElbSecurityGroupsVmPaths(pathList []types.Path) []types.Path {

	var finalPathList []types.Path

	// Find paths with elbv2 & security group/listener pattern in front of it.

	// Build a map from elbv2 id to path returned (if successfully returned).
	loadbalancerNodeIdToPathMap := make(map[int64]types.Path)
	for _, path := range pathList {
		patternExists, computedPath := CheckElbSecurityGroupPattern(path)
		if patternExists {
			// Loop through nodes and get node with elbv2.
			var elbv2Node types.Node
			for _, computedPathNode := range computedPath.Nodes {
				if CheckNodeLabel(computedPathNode, "LoadBalancerV2") {
					elbv2Node = computedPathNode
				}
			}
			if elbv2Node.Id > 0 {
				loadbalancerNodeIdToPathMap[elbv2Node.Id] = computedPath
			}
		}
	}

	// Find the elbv2 to exposing Ec2 VM path. Augment/alter these paths.
	// for _, path := range pathList {

	// }

	// Construct the finalPathList to return. Maintains all the same
	// paths but also has
	return finalPathList
}

// Returns a processed path for a EC2 (VM) with a Security group.
// Path from ip range to ip rule to security group to ec2.
func ProcessIpRangeRulePermissionsEc2Path(path types.Path) types.Path {
	nodeList := path.Nodes
	relationshipList := path.Relationships

	nodeIdToNodeMap := make(map[int64]types.Node)
	for _, node := range nodeList {
		nodeIdToNodeMap[node.Id] = node
	}

	ipRangeToRuleEdge := false
	ipRuleToEc2Edge := false
	ec2ToSecurityGroupEdge := false

	var ec2Node types.Node
	var sgNode types.Node
	var ec2ToSgRelationship types.Relationship

	for _, relationship := range relationshipList {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := nodeIdToNodeMap[startNodeId]
		endNode := nodeIdToNodeMap[endNodeId]

		if edgeType == "MEMBER_OF_IP_RULE" {
			if CheckNodeLabel(startNode, "IpRange") && CheckNodeLabel(endNode, "IpRule") {
				ipRangeToRuleEdge = true
			}
		}

		if edgeType == "MEMBER_OF_EC2_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "IpRule") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				ipRuleToEc2Edge = true
			}

			if CheckNodeLabel(startNode, "EC2Instance") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				ec2ToSecurityGroupEdge = true
				ec2Node = startNode
				sgNode = endNode
				ec2ToSgRelationship = relationship
			}
		}
	}

	// if any of those edges are false
	if !ipRangeToRuleEdge || !ipRuleToEc2Edge || !ec2ToSecurityGroupEdge {
		return path
	}

	processedNodeList := []types.Node{ec2Node, sgNode}
	processedRelationshipList := []types.Relationship{ec2ToSgRelationship}

	return types.Path{
		Nodes:         processedNodeList,
		Relationships: processedRelationshipList,
	}
}

// Returns a processed path for a EC2 (VM) with a Security group.
// This one has a network interface and requires and edge to be made
// from the ec2 and security group.
func ProcessIpRangeRuleNetworkInterfaceEc2Path(path types.Path) types.Path {

	nodeList := path.Nodes
	relationshipList := path.Relationships

	nodeIdToNodeMap := make(map[int64]types.Node)
	for _, node := range nodeList {
		nodeIdToNodeMap[node.Id] = node
	}

	ipRangeToRuleEdge := false
	ipRuleToSecurityGroup := false
	networkInterfaceToSecurityGroup := false
	ec2ToNetworkInterface := false

	var ec2Node types.Node
	var sgNode types.Node
	var ec2ToSgRelationship types.Relationship

	for _, relationship := range relationshipList {
		startNodeId := relationship.StartId
		endNodeId := relationship.EndId
		edgeType := relationship.Type

		startNode := nodeIdToNodeMap[startNodeId]
		endNode := nodeIdToNodeMap[endNodeId]

		if edgeType == "MEMBER_OF_IP_RULE" {
			if CheckNodeLabel(startNode, "IpRange") && CheckNodeLabel(endNode, "IpRule") {
				ipRangeToRuleEdge = true
			}
		}

		if edgeType == "MEMBER_OF_EC2_SECURITY_GROUP" {
			if CheckNodeLabel(startNode, "IpRule") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				ipRuleToSecurityGroup = true
			}

			if CheckNodeLabel(startNode, "NetworkInterface") && CheckNodeLabel(endNode, "EC2SecurityGroup") {
				sgNode = endNode
				networkInterfaceToSecurityGroup = true
			}
		}

		if edgeType == "NETWORK_INTERFACE" {
			if CheckNodeLabel(startNode, "EC2Instance") && CheckNodeLabel(endNode, "NetworkInterface") {
				ec2Node = startNode
				ec2ToNetworkInterface = true
			}
		}
	}

	// if any of those edges are false
	if !ipRangeToRuleEdge || !ipRuleToSecurityGroup || !networkInterfaceToSecurityGroup ||
		!ec2ToNetworkInterface {
		return path
	}

	processedNodeList := []types.Node{ec2Node, sgNode}

	// Generate random relationship id, doesn't matter
	ec2ToSgRelationship = types.Relationship{
		Id:      0,
		StartId: ec2Node.Id,
		EndId:   sgNode.Id,
		Type:    "MEMBER_OF_EC2_SECURITY_GROUP",
	}
	processedRelationshipList := []types.Relationship{ec2ToSgRelationship}

	return types.Path{
		Nodes:         processedNodeList,
		Relationships: processedRelationshipList,
	}
}

// ProcessPubliclyExposedVmPaths takes an input of a single set of paths associated with
// 1 EC2 VM. Assumes that there is a publicly exposed vm (direct and/or indirect).
func ProcessPubliclyExposedVmPaths(graphPathResult types.GraphPathResult) types.GraphPathResult {
	// Take paths relevant to publicly exposed VM and output only relevant nodes
	// and relationships.

	// Get nodes with security groups and ec2.
	showPublicNodeList := make(map[int64]types.Node)

	acceptableNodeLabels := make(map[string]bool)
	acceptableNodeLabels["EC2SecurityGroup"] = true
	acceptableNodeLabels["EC2Instance"] = true
	acceptableNodeLabels["Instance"] = true

	var unChangedPaths []types.Path
	// Retrieves all possible security groups and EC2 instance relevant.
	for _, path := range graphPathResult.PathResult {
		changedPath := false
		for _, node := range path.Nodes {
			for _, label := range node.Labels {
				_, labelAcceptable := acceptableNodeLabels[label]
				_, nodeAlreadyPresent := showPublicNodeList[node.Id]
				if labelAcceptable && !nodeAlreadyPresent {
					showPublicNodeList[node.Id] = node
					changedPath = true
				}
			}
		}
		if !changedPath {
			unChangedPaths = append(unChangedPaths, path)
		}
	}

	var filteredRelationshipList []types.Relationship
	var filteredNodesList []types.Node
	for _, path := range graphPathResult.PathResult {
		for _, relationship := range path.Relationships {
			endNode, endNodePresent := showPublicNodeList[relationship.EndId]
			startNode, startNodePresent := showPublicNodeList[relationship.StartId]
			if endNodePresent && startNodePresent {
				filteredNodesList = append(filteredNodesList, endNode, startNode)
				filteredRelationshipList = append(filteredRelationshipList, relationship)
			}
		}
	}

	var processedGraphResult types.GraphPathResult
	// Path of publicly accessible VM.
	var publiclyAccessiblePath types.Path
	publiclyAccessiblePath.Nodes = filteredNodesList
	publiclyAccessiblePath.Relationships = filteredRelationshipList

	processedGraphResult.PathResult = append(processedGraphResult.PathResult, publiclyAccessiblePath)
	for _, unchagedPath := range unChangedPaths {
		processedGraphResult.PathResult = append(processedGraphResult.PathResult, unchagedPath)
	}
	return processedGraphResult
}
