package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func getRelationshipReason(tx neo4j.Transaction, edgeID int) (neo4j.Result, error) {
	params := map[string]interface{}{
		"edge_id": edgeID,
	}
	record, err := tx.Run(
		`match ()-[r:PRIVILEGE_ESCALATION]->() where ID(r)=$edge_id return r.relationship_reason`,
		params)

	if err != nil {
		return nil, err
	}

	return record, nil
}

func GetPrivelegeEscalationReason(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
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
			record, err := getRelationshipReason(tx, edgeID)
			if err != nil {
				return nil, err
			}
			return record, nil
		})
		if err != nil {
			log.Printf("failed to get privelege escalation relationship reason %v", err)
			http.Error(w, "failed to get privelege escalation relationship reason", 500)
		}
		log.Printf("result=%v", result)
		retDataBytes, err := json.Marshal(result)
		if err != nil {
			log.Printf("failed to marshal %v error: %v", result, err)
			http.Error(w, "failed to get privelege escalation relationship reason", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
