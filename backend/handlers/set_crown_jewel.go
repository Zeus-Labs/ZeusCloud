package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/Zeus-Labs/ZeusCloud/control"
	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func setCrownJewelQuery(tx neo4j.Transaction, nodeID int, isCrownJewel bool) error {
	params := map[string]interface{}{
		"nodeID":       nodeID,
		"isCrownJewel": isCrownJewel,
	}
	_, err := tx.Run(
		`MATCH (node) where ID(node)=$nodeID
		SET node.is_crown_jewel=$isCrownJewel`,
		params)

	return err
}

func SetCrownJewel(driver neo4j.Driver) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		node_id := r.URL.Query().Get("node_id")
		nodeID, err := strconv.Atoi(node_id)
		if err != nil {
			log.Printf("invalid node_id: %v parameter %v", node_id, err)
			http.Error(w, "invalid node_id parameter", 400)
			return
		}
		is_crown_jewel := r.URL.Query().Get("is_crown_jewel")
		isCrownJewel, err := strconv.ParseBool(is_crown_jewel)
		if err != nil {
			log.Printf("invalid is_crown_jewel parameter %v", err)
			http.Error(w, "invalid is_crown_jewel parameter", 400)
		}

		session := driver.NewSession(neo4j.SessionConfig{
			AccessMode:   neo4j.AccessModeWrite,
			DatabaseName: "neo4j",
		})
		defer session.Close()

		result, writeErr := session.WriteTransaction(func(tx neo4j.Transaction) (interface{}, error) {
			err := setCrownJewelQuery(tx, nodeID, isCrownJewel)
			if err != nil {
				return nil, err
			}
			// Marking the crown jewel bool value in order for rules to execute
			control.CrownJewelMutex.Lock()
			control.CrownJewelMarked = true
			control.CrownJewelMutex.Unlock()

			return "is_crown_jewel value set successfully", nil
		})
		if writeErr != nil {
			log.Printf("Error in setting the is_crown_jewel value for node with ID = %v, Error: %v", nodeID, writeErr)
			http.Error(w, "failed to set the is_crown_jewel", 500)
			return
		}
		retDataBytes, err := json.Marshal(result)
		if err != nil {
			log.Printf("failed to marshal %v error: %v", result, err)
			http.Error(w, "failed to set the is_crown_jewel", 500)
			return
		}
		w.Write(retDataBytes)
	}
}
