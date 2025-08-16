package db

import (
	"database/sql"
	"log"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB(cfg *config.Config) {
	var err error
	DB, err = sql.Open(cfg.DBDriver, cfg.DBDsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Printf("Connected to %s database", cfg.DBDriver)
}
