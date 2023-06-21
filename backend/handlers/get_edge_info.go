package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

type PrivelegeEscalationInfo struct {
	RelationshipReason string `json:"relationship_reason"`
	EdgeType           string `json:"edge_type"`
}

type PolicyInfo struct {
	IdentityPolicies []IdentityPolicy `json:"identity_policies,omitempty"`
	EdgeType         string           `json:"edge_type,omitempty"`
	ResourcePolicy   string           `json:"resource_policy,omitempty"`
}

type IdentityPolicy struct {
	Arn        interface{}       `json:"arn"`
	Type       interface{}       `json:"policy_type"`
	Statements []PolicyStatement `json:"policy_statements,omitempty"`
}

type PolicyStatement struct {
	Sid         interface{} `json:"Sid,omitempty"`
	Resource    interface{} `json:"Resource,omitempty"`
	Effect      interface{} `json:"Effect,omitempty"`
	Action      interface{} `json:"Action,omitempty"`
	NotAction   interface{} `json:"NotAction,omitempty"`
	Condition   interface{} `json:"Condition,omitempty"`
	NotResource interface{} `json:"NotResource,omitempty"`
}

type S3BucketStatement struct {
	PolicyId      interface{} `json:"Policy ID,omitempty"`
	PolicyVersion interface{} `json:"Policy Version,omitempty"`
	Sid           interface{} `json:"Sid,omitempty"`
	Bucket        interface{} `json:"Bucket,omitempty"`
	Resource      interface{} `json:"Resource,omitempty"`
	Effect        interface{} `json:"Effect,omitempty"`
	Action        interface{} `json:"Action,omitempty"`
	Condition     interface{} `json:"Condition,omitempty"`
	Principal     interface{} `json:"Principal,omitempty"`
}

type EdgeParameters struct {
	edgeType     string
	srcLabels    []string
	targetLabels []string
}

func getRelationshipReason(tx neo4j.Transaction, edgeID int) (neo4j.Result, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	record, err := tx.Run(
		`match ()-[r:PRIVILEGE_ESCALATION]->() where ID(r)=$edge_id return r.relationship_reason as relationship_reason;`,
		params)

	if err != nil {
		return nil, err
	}

	return record, nil
}

func IdentityPolicyQuery(tx neo4j.Transaction, edgeID int) (neo4j.Result, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	records, err := tx.Run(
		`match (n)-[r]->(t) where ID(r)=$edge_id 
		WITH n
		MATCH (n)-[:POLICY]-(p:AWSPolicy)-[:STATEMENT]-(s:AWSPolicyStatement)
		WITH p, collect({resource:s.resource,
			notaction:s.notaction,
			action:s.action,
			effect:s.effect,
			condition:s.condition,
			notresource:s.notresource,
			sid:s.sid
			}) as statement_lst
		return {arn: p.id,type: p.type} as policy, statement_lst`,
		params)

	if err != nil {
		return nil, err
	}

	return records, nil
}

func getEdgeParameters(tx neo4j.Transaction, edgeID int) (EdgeParameters, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	records, err := tx.Run(
		`match (s)-[r]->(t) where ID(r)=$edge_id 
		return type(r) as type, labels(s) as srcLabels, labels(t) as targetLabels;`,
		params)

	if err != nil {
		return EdgeParameters{}, err
	}

	var edgeParameters EdgeParameters

	for records.Next() {
		record := records.Record()

		edgeType, _ := record.Get("type")

		edgeTypeStr, ok := edgeType.(string)
		if !ok {
			return EdgeParameters{}, fmt.Errorf("edge type %v must be a string", edgeType)
		}
		srcLabels, _ := record.Get("srcLabels")
		srcLabelLst, err := CastToStrLst(srcLabels, "labels must be a slice of strings")

		if err != nil {
			return EdgeParameters{}, err
		}

		targetLabels, _ := record.Get("targetLabels")

		targetLabelLst, err := CastToStrLst(targetLabels, "labels must be a slice of strings")
		if err != nil {
			return EdgeParameters{}, err
		}

		edgeParameters = EdgeParameters{
			edgeType:     edgeTypeStr,
			srcLabels:    srcLabelLst,
			targetLabels: targetLabelLst,
		}

	}
	return edgeParameters, nil
}

func CastToStrLst(varInterface interface{}, errorText string) ([]string, error) {

	var resultLst []string
	lst, ok := varInterface.([]interface{})
	if !ok {
		return nil, fmt.Errorf(errorText)
	}
	for _, elm := range lst {
		elmlStr, ok := elm.(string)
		if !ok {
			return nil, fmt.Errorf(errorText)
		}
		resultLst = append(resultLst, elmlStr)
	}
	return resultLst, nil
}

func getPrivelegeEscalationReason(tx neo4j.Transaction, edgeID int, edgeType string) (interface{}, error) {

	records, err := getRelationshipReason(tx, edgeID)
	if err != nil {
		return nil, err
	}
	retrievedPrivelgeEscalationInfo := PrivelegeEscalationInfo{
		EdgeType: edgeType,
	}
	for records.Next() {
		record := records.Record()
		relationshipReason, _ := record.Get("relationship_reason")
		relationshipReasonStr, ok := relationshipReason.(string)
		if !ok {
			return nil, fmt.Errorf("relationship reason %v should be of type string", relationshipReason)
		}
		retrievedPrivelgeEscalationInfo.RelationshipReason = relationshipReasonStr
	}
	return retrievedPrivelgeEscalationInfo, nil
}

func getS3BucketResourcePolicy(tx neo4j.Transaction, edgeID int) (string, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}

	records, err := tx.Run(
		`match (n)-[r]->(t) where ID(r)=$edge_id
		WITH t
		match (t)-[:POLICY_STATEMENT]->(statement:S3PolicyStatement)
		return collect({
			policy_id: statement.policy_id,
			policy_version: statement.policy_version,
			bucket: statement.bucket,
			sid: statement.sid,
			effect: statement.effect,
			action: statement.action,
			resource: statement.resource,
			principal: statement.principal,
			condition: statement.condition
			}) as statement_lst;`,
		params)

	if err != nil {
		return "", err
	}
	PolicyStatements := []S3BucketStatement{}
	for records.Next() {
		record := records.Record()
		statements, _ := record.Get("statement_lst")
		statementLst, ok := statements.([]interface{})
		if !ok {
			return "", fmt.Errorf("S3 bucket statements should be a list of interface")
		}

		for _, statement := range statementLst {
			var PolicyStatement S3BucketStatement
			collectedStatement, ok := statement.(map[string]interface{})
			if !ok {
				return "", fmt.Errorf("s3 bucket statement should be a map type")
			}
			PolicyStatement = S3BucketStatement{
				PolicyId:      collectedStatement["policy_id"],
				PolicyVersion: collectedStatement["policy_version"],
				Sid:           collectedStatement["sid"],
				Bucket:        collectedStatement["bucket"],
				Resource:      collectedStatement["resource"],
				Action:        collectedStatement["action"],
				Effect:        collectedStatement["effect"],
			}

			if collectedStatement["condition"] != nil {
				principalStr, ok := collectedStatement["principal"].(string)
				if !ok {
					return "", fmt.Errorf("principal must be a string value")
				}

				err = json.Unmarshal([]byte(principalStr), &PolicyStatement.Principal)
				if err != nil {
					return "", fmt.Errorf("Error in unmarshalling the principal %v", err)
				}
			}

			if collectedStatement["condition"] != nil {
				conditionStr, ok := collectedStatement["condition"].(string)
				if !ok {
					return "", fmt.Errorf("condition must be a string value")
				}

				err = json.Unmarshal([]byte(conditionStr), &PolicyStatement.Condition)
				if err != nil {
					return "", fmt.Errorf("Error in unmarshalling the condition %v", err)
				}
			}

			PolicyStatements = append(PolicyStatements, PolicyStatement)
		}

	}
	StatementsStr, err := json.Marshal(PolicyStatements)
	if err != nil {
		return "", fmt.Errorf("Error in marshalling the s3 bucket statements %v", err)
	}
	return string(StatementsStr), nil
}

func getTrustPolicy(tx neo4j.Transaction, edgeID int) (string, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	records, err := tx.Run(
		`match ()-[r]->(t) where ID(r)=$edge_id
		return t.trust_policy as resource_policy`,
		params)

	if err != nil {
		return "", err
	}
	var resultRourcePolicy string
	for records.Next() {
		record := records.Record()
		policy, _ := record.Get("resource_policy")
		policyStr, ok := policy.(string)
		if !ok {
			return "", fmt.Errorf("resource policy must be of type string")
		}
		resultRourcePolicy = policyStr
	}

	return resultRourcePolicy, nil
}

type getResourcePolicy func(tx neo4j.Transaction, edgeID int) (string, error)

var labelToResoucePolicy = map[string]getResourcePolicy{
	"AWSPrincipal": getTrustPolicy,
	"S3Bucket":     getS3BucketResourcePolicy,
}

func getPolicyInfo(tx neo4j.Transaction, edgeID int, targetLabel string, edgeType string, isIdentityPolicy bool) (interface{}, error) {

	retrievedPolicyInfo := PolicyInfo{}
	retrievedPolicyInfo.EdgeType = edgeType
	if isIdentityPolicy {
		records, err := IdentityPolicyQuery(tx, edgeID)
		if err != nil {
			return nil, err
		}

		for records.Next() {
			record := records.Record()
			policy, _ := record.Get("policy")

			identityPolicy, ok := policy.(map[string]interface{})
			if !ok {
				return nil, fmt.Errorf("falied to retrieve policy document")
			}
			statements, _ := record.Get("statement_lst")
			retrievedStatements, ok := statements.([]interface{})
			if !ok {
				return nil, fmt.Errorf("failed to retrieve policy statements")
			}
			// finalStatements
			policyStatements := []PolicyStatement{}
			for _, retrievedStatement := range retrievedStatements {
				policyStatement, ok := retrievedStatement.(map[string]interface{})
				if !ok {
					return nil, fmt.Errorf("failed to retrieve policy statement")
				}
				finalStatement := PolicyStatement{
					Sid:         policyStatement["sid"],
					Resource:    policyStatement["resource"],
					Action:      policyStatement["action"],
					Effect:      policyStatement["effect"],
					NotAction:   policyStatement["notaction"],
					NotResource: policyStatement["notresource"],
				}

				if policyStatement["condition"] != nil {
					conditionStr, ok := policyStatement["condition"].(string)
					if !ok {
						return nil, fmt.Errorf("condition field in policy statement must be a string")
					}
					err = json.Unmarshal([]byte(conditionStr), &finalStatement.Condition)
					if err != nil {
						return nil, fmt.Errorf("error in unmarshalling the condition field in policy statement %v", err)
					}
				}

				policyStatements = append(policyStatements, finalStatement)
			}
			retrievedPolicyInfo.IdentityPolicies = append(retrievedPolicyInfo.IdentityPolicies, IdentityPolicy{
				Arn:        identityPolicy["arn"],
				Type:       identityPolicy["type"],
				Statements: policyStatements,
			})
		}
	}

	resourcePolicy, err := labelToResoucePolicy[targetLabel](tx, edgeID)
	if err != nil {
		return nil, err
	}
	retrievedPolicyInfo.ResourcePolicy = resourcePolicy
	return retrievedPolicyInfo, nil
}

func Contains(s []string, search string) bool {
	for _, value := range s {
		if value == search {
			return true
		}
	}
	return false
}

func GetEdgeInfo(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		edge_id := r.URL.Query().Get("edge_id")
		edgeID, err := strconv.Atoi(edge_id)
		if err != nil {
			log.Printf("invalid edge_id parameter %v", err)
			http.Error(w, "invalid edge_id parameter", 400)
			return
		}

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeRead,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		result, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
			edgeParameters, err := getEdgeParameters(tx, edgeID)
			if err != nil {
				return nil, fmt.Errorf("Error in retrieving edge parameters %v", err)
			}
			edgeType := edgeParameters.edgeType
			targetLabelLst := edgeParameters.targetLabels

			srcLableLst := edgeParameters.srcLabels

			switch edgeType {
			case "PRIVILEGE_ESCALATION":
				return getPrivelegeEscalationReason(tx, edgeID, edgeType)
			case "STS_ASSUME_ROLE_ALLOW":
				if Contains(srcLableLst, "AWSPrincipal") {
					return getPolicyInfo(tx, edgeID, "AWSPrincipal", edgeType, true)
				} else if Contains(srcLableLst, "EC2Instance") {
					return getPolicyInfo(tx, edgeID, "AWSPrincipal", edgeType, false)
				}
				return nil, fmt.Errorf("This edge is not categorised yet")
			case "HAS_POLICY_ACCESS":
				if Contains(srcLableLst, "AWSPrincipal") && Contains(targetLabelLst, "S3Bucket") {
					return getPolicyInfo(tx, edgeID, "S3Bucket", edgeType, true)
				}
				return nil, fmt.Errorf("This edge is not categorised yet")
			default:
				return map[string]string{
					"edge_type": edgeType,
				}, nil
			}
		})
		if err != nil {
			log.Printf("failed to retrieve edge info %v", err)
			http.Error(w, "failed to retrieve edge info", 500)
			return
		}
		retDataBytes, err := json.Marshal(result)
		if err != nil {
			log.Printf("failed to marshal %v error: %v", result, err)
			http.Error(w, "failed to get edge info", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
