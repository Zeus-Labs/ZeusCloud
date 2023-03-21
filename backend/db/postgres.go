package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitPostgres() *gorm.DB {
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	port := os.Getenv("POSTGRES_PORT")
	database := os.Getenv("POSTGRES_DB")
	host := os.Getenv("POSTGRES_HOST")

	connStr := fmt.Sprintf("host=%s user=%s password=%s port=%s database=%s sslmode=disable", host, user, password, port, database)
	var db *gorm.DB
	var err error
	for {
		db, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
		if err != nil {
			log.Printf("Error connecting to postgres db: %v... Trying again...", err)
			time.Sleep(5 * time.Second)
			continue
		}
		break
	}

	err = db.AutoMigrate(&models.RuleData{}, &models.RuleResult{}, &models.AccountDetails{})
	if err != nil {
		log.Fatal(err)
	}

	return db
}
