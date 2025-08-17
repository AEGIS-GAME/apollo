package config

import (
	"database/sql"
	"os"
)

type Config struct {
	DBDriver  string
	DBDsn     string
	JWTSecret string
}

type App struct {
	Config *Config
	DB     *sql.DB
}

func Load() *Config {
	cfg := &Config{
		DBDriver:  getEnv("DB_DRIVER", "sqlite3"),
		DBDsn:     getEnv("DB_DSN", "./dev.db"),
		JWTSecret: getEnv("JWT_SECRET", "devsecret123"),
	}
	return cfg
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}
