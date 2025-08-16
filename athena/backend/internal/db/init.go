package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	dbType := os.Getenv("DB_TYPE")
	dsn := os.Getenv("DB_URL")

	var err error
	DB, err = sql.Open(dbType, dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Printf("Connected to %s database", dbType)
}
