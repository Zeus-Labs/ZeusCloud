package db

import (
	"log"
	"os"
	"time"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j"
)

func testNeo4jConnection(driver neo4j.Driver) error {
	session := driver.NewSession(neo4j.SessionConfig{
		AccessMode:   neo4j.AccessModeRead,
		DatabaseName: "neo4j",
	})
	defer session.Close()
	_, err := session.ReadTransaction(func(tx neo4j.Transaction) (interface{}, error) {
		return tx.Run(`MATCH (n) RETURN n limit 1`, nil)
	})
	return err
}

func InitNeo4j() neo4j.Driver {
	driver, err := neo4j.NewDriver(
		os.Getenv("NEO4J_URI"),
		neo4j.NoAuth(),
	)
	if err != nil {
		log.Fatal(err)
	}
	for {
		if err := testNeo4jConnection(driver); err != nil {
			log.Printf("Error connecting to neo4j database: %v... Trying again...", err)
			time.Sleep(5 * time.Second)
			continue
		}
		break
	}
	return driver
}
