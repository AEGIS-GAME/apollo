package users

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const (
	AccessTokenDuration  = 15 * time.Minute
	RefreshTokenDuration = 7 * 24 * time.Hour
	RefreshTokenType     = "refresh"
	MinPasswordLength    = 8
	MaxUsernameLength    = 50
)

var (
	ErrMissingJWTSecret     = errors.New("JWT_SECRET environment variable not set")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUsernameAlreadyTaken = errors.New("username already taken")
	ErrInvalidUsername      = errors.New("invalid username")
	ErrWeakPassword         = errors.New("password too weak")
)

type UserInfo struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	IsAdmin  bool      `json:"is_admin"`
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	User         UserInfo `json:"user"`
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func decodeJSON(r *http.Request, dst any) error {
	return json.NewDecoder(r.Body).Decode(dst)
}

func respondWithAuth(w http.ResponseWriter, tokens *TokenPair, user *models.User) error {
	response := AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		User: UserInfo{
			ID:       user.ID,
			Username: user.Username,
			IsAdmin:  user.IsAdmin,
		},
	}
	w.Header().Set("Content-Type", "application/json")
	return json.NewEncoder(w).Encode(response)
}

func validatePassword(password string) error {
	if len(password) < MinPasswordLength {
		return ErrWeakPassword
	}
	return nil
}

func validateUsername(username string) error {
	var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	username = strings.TrimSpace(username)

	if len(username) == 0 || len(username) > MaxUsernameLength {
		return ErrInvalidUsername
	}

	if !usernameRegex.MatchString(username) {
		return ErrInvalidUsername
	}
	return nil
}

func RegisterHandler(dbConn *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			handleAuthError(w, err)
			return
		}

		if err := validateUsername(req.Username); err != nil {
			handleAuthError(w, err)
			return
		}

		if err := validatePassword(req.Password); err != nil {
			handleAuthError(w, err)
			return
		}

		existingUser, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			handleAuthError(w, err)
			return
		}

		if existingUser != nil {
			handleAuthError(w, ErrUsernameAlreadyTaken)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			handleAuthError(w, err)
			return
		}

		user := &models.User{
			ID:           uuid.New(),
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			IsAdmin:      false,
		}

		if err := db.CreateUser(dbConn, user); err != nil {
			handleAuthError(w, err)
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			handleAuthError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			handleAuthError(w, err)
		}
	}
}

func LoginHandler(dbConn *sql.DB, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			handleAuthError(w, err)
			return
		}

		user, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			handleAuthError(w, err)
			return
		}
		if user == nil {
			handleAuthError(w, ErrInvalidCredentials)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			handleAuthError(w, ErrInvalidCredentials)
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			handleAuthError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			handleAuthError(w, err)
		}
	}
}

func getTokenPair(userID uuid.UUID, jwtSecret string) (*TokenPair, error) {
	accessToken, err := generateToken(userID, jwtSecret, AccessTokenDuration, "")
	if err != nil {
		return nil, err
	}

	refreshToken, err := generateToken(userID, jwtSecret, RefreshTokenDuration, RefreshTokenType)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func generateToken(userID uuid.UUID, jwtSecret string, duration time.Duration, tokenType string) (string, error) {
	if jwtSecret == "" {
		return "", ErrMissingJWTSecret
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     now.Add(duration).Unix(),
		"iat":     now.Unix(),
	}

	if tokenType != "" {
		claims["type"] = tokenType
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}

func handleAuthError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrInvalidCredentials):
		shared.RespondWithError(w, http.StatusUnauthorized, "invalid credentials")
	case errors.Is(err, ErrUsernameAlreadyTaken):
		shared.RespondWithError(w, http.StatusConflict, "username already taken")
	case errors.Is(err, ErrWeakPassword):
		shared.RespondWithError(w, http.StatusBadRequest, "password too weak")
	case errors.Is(err, ErrMissingJWTSecret):
		shared.RespondWithError(w, http.StatusInternalServerError, "misconfigured server")
	default:
		shared.RespondWithError(w, http.StatusInternalServerError, "server error")
	}
}
