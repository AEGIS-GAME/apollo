package db

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/google/uuid"
)

func CreateUser(db *sql.DB, user *models.User) error {
	_, err := db.Exec(
		"INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)",
		user.ID, user.Username, user.PasswordHash,
	)

	return err
}

func GetUserByUsername(db *sql.DB, username string) (*models.User, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, fmt.Errorf("username cannot be empty")
	}

	user := &models.User{}

	row := db.QueryRow("SELECT id, username, password_hash FROM users WHERE username = ?", username)
	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}

func GetUserByID(db *sql.DB, id uuid.UUID) (*models.User, error) {
	user := &models.User{}

	row := db.QueryRow("SELECT id, username, password_hash FROM users WHERE id = ?", id)
	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}
