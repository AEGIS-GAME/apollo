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
	query := "INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)"
	_, err := db.Exec(query, user.ID, user.Username, user.PasswordHash)

	return err
}

func GetUserByUsername(db *sql.DB, username string) (*models.User, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return nil, fmt.Errorf("username cannot be empty")
	}

	user := &models.User{}

	query := "SELECT id, username, password_hash FROM users WHERE username = $1"
	row := db.QueryRow(query, username)
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

	query := "SELECT id, username, password_hash FROM users WHERE id = $1"
	row := db.QueryRow(query, id)
	if err := row.Scan(&user.ID, &user.Username, &user.PasswordHash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return user, nil
}

func DeleteUserByID(db *sql.DB, id uuid.UUID) error {
	query := "DELETE FROM users WHERE id = $1"

	result, err := db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
