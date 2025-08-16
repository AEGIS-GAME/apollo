package users

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func RegisterHandler(dbConn *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AuthRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			shared.RespondWithError(w, http.StatusBadRequest, "invalid request")
			return
		}

		existingUser, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}

		if existingUser != nil {
			shared.RespondWithError(w, http.StatusConflict, "username already taken")
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}

		user := &models.User{
			ID:           uuid.New(),
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			IsAdmin:      false,
		}

		if err := db.CreateUser(dbConn, user); err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{
			AccessToken:  tokens.AccessToken,
			RefreshToken: tokens.RefreshToken,
		})
	}
}

func LoginHandler(dbConn *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AuthRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			shared.RespondWithError(w, http.StatusBadRequest, "invalid request")
			return
		}

		user, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}
		if user == nil {
			shared.RespondWithError(w, http.StatusConflict, "invalid credentials")
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			shared.RespondWithError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			shared.RespondWithError(w, http.StatusInternalServerError, "server error")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(AuthResponse{
			AccessToken:  tokens.AccessToken,
			RefreshToken: tokens.RefreshToken,
		})
	}
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func getTokenPair(userID uuid.UUID, jwtSecret string) (*TokenPair, error) {
	if jwtSecret == "" {
		return nil, ErrMissingJWTSecret
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(15 * time.Minute).Unix(),
	})
	accessTokenString, err := accessToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return nil, err
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     time.Now().Add(7 * 24 * time.Hour).Unix(),
		"type":    "refresh",
	})
	refreshTokenString, err := refreshToken.SignedString([]byte(jwtSecret))
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

var ErrMissingJWTSecret = errors.New("JWT_SECRET environment variable not set")
