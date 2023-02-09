package db

import (
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/IronLeap/IronCloud/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitPostgres() *gorm.DB {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	port := os.Getenv("POSTGRES_PORT")
	database := os.Getenv("POSTGRES_DB")
	host := os.Getenv("POSTGRES_HOST")

	if os.Getenv("ENCRYPTION_KEY") == "" {
		log.Fatal(fmt.Errorf("encryption key is required"))
	}
	log.Printf("%v", os.Getenv("ENCRYPTION_KEY"))
	encryptionKey, err := base64.StdEncoding.DecodeString(os.Getenv("ENCRYPTION_KEY"))
	if err != nil {
		log.Fatal(err)
	}

	connStr := fmt.Sprintf("host=%s user=%s password=%s port=%s database=%s sslmode=disable", host, user, password, port, database)
	var db *gorm.DB
	for {
		db, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
		if err != nil {
			log.Printf("Error connecting to postgres db: %v... Trying again...", err)
			time.Sleep(5 * time.Second)
			continue
		}
		break
	}

	models.SetEncryptionKey(encryptionKey)

	err = db.AutoMigrate(&models.RuleData{}, &models.RuleResult{}, &models.AccountDetails{})
	if err != nil {
		log.Fatal(err)
	}

	return db
}
