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

type AssumeRoleInfo struct {
	EdgeType string `json:"edge_type"`
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

func AssumeRoleQuery(tx neo4j.Transaction, edgeID int) (neo4j.Result, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	record, err := tx.Run(
		`match ()-[r]->() where ID(r)=$edge_id return type(r) as type;`,
		params)

	if err != nil {
		return nil, err
	}

	return record, nil
}

func getEdgeType(tx neo4j.Transaction, edgeID int) (string, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	records, err := tx.Run(
		`match ()-[r]->() where ID(r)=$edge_id return type(r) as type;`,
		params)

	if err != nil {
		return "None", err
	}

	var resultEdgeType string

	for records.Next() {
		record := records.Record()
		edgeType, _ := record.Get("type")
		edgeTypeStr, ok := edgeType.(string)
		if !ok {
			return "None", fmt.Errorf("edge type %v must be a string", edgeType)
		}
		resultEdgeType = edgeTypeStr
	}
	return resultEdgeType, nil
}

func getPrivelegeEscalationReason(tx neo4j.Transaction, edgeID int) (interface{}, error) {

	records, err := getRelationshipReason(tx, edgeID)
	if err != nil {
		return nil, err
	}
	retrievedPrivelgeEscalationInfo := PrivelegeEscalationInfo{
		EdgeType: "PRIVILEGE_ESCALATION",
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

func getAssumeRoleInfo(tx neo4j.Transaction, edgeID int) (interface{}, error) {

	records, err := AssumeRoleQuery(tx, edgeID)
	if err != nil {
		return nil, err
	}
	retrievedAssumeRoleInfo := AssumeRoleInfo{}
	for records.Next() {
		record := records.Record()
		edgeType, _ := record.Get("type")
		edgeTypeStr, ok := edgeType.(string)
		if !ok {
			return nil, fmt.Errorf("edge type %v should be of type string", edgeType)
		}
		retrievedAssumeRoleInfo.EdgeType = edgeTypeStr
	}
	return retrievedAssumeRoleInfo, nil
}

func GetEdgeInfo(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
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
			edgeType, err := getEdgeType(tx, edgeID)
			if err != nil {
				log.Printf("Error in retrieving edge type", err)
				return nil, fmt.Errorf("Error in retrieving edge type %v", err)
			}
			switch edgeType {
			case "PRIVILEGE_ESCALATION":
				return getPrivelegeEscalationReason(tx, edgeID)
			case "STS_ASSUME_ROLE_ALLOW":
				return getAssumeRoleInfo(tx, edgeID)
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
