package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	if err := godotenv.Load(".env.development"); err != nil {
		log.Fatal("No .env.dev file found")
	}

	dbType := os.Getenv("DB_TYPE")
	dbURL := os.Getenv("DB_URL")
	if dbType == "" || dbURL == "" {
		log.Fatal("DB_TYPE and DB_URL must be set in environment variables")
	}

	if dbType == "sqlite" {
		if _, err := os.Stat(dbURL); os.IsNotExist(err) {
			file, err := os.Create(dbURL)
			if err != nil {
				log.Fatalf("Failed to create SQLite file: %v", err)
			}
			file.Close()
		}
	}

	db, err := sql.Open(dbType, dbURL)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	schema, err := os.ReadFile("dbSchema.sql")
	if err != nil {
		log.Fatalf("Failed to read schema file: %v", err)
	}

	if _, err := db.Exec(string(schema)); err != nil {
		log.Fatalf("Failed to execute schema: %v", err)
	}

	fmt.Println("Database migration complete!")
}
