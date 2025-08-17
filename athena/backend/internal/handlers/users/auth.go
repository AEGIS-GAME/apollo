package users

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
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
	MinUsernameLength    = 3
	MaxUsernameLength    = 50
)

var (
	ErrMissingJWTSecret     = errors.New("JWT_SECRET environment variable not set")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUsernameAlreadyTaken = errors.New("username already taken")
	ErrInvalidUsername      = errors.New("invalid username")
	ErrWeakPassword         = errors.New("password too weak")
	ErrMissingRefreshToken  = errors.New("missing refresh token")
	ErrInvalidToken         = errors.New("invalid token")
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

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func decodeJSON(r *http.Request, dst any) error {
	return json.NewDecoder(r.Body).Decode(dst)
}

func respondWithAuth(w http.ResponseWriter, tokens *TokenPair, user *models.User) error {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    tokens.AccessToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   int(AccessTokenDuration.Seconds()),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokens.RefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   int(RefreshTokenDuration.Seconds()),
	})

	response := UserInfo{
		ID:       user.ID,
		Username: user.Username,
		IsAdmin:  user.IsAdmin,
	}

	shared.RespondWithJSON(w, http.StatusOK, response)
	return nil
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

	if len(username) == 0 || len(username) < MinUsernameLength || len(username) > MaxUsernameLength {
		return ErrInvalidUsername
	}

	if !usernameRegex.MatchString(username) {
		return ErrInvalidUsername
	}
	return nil
}

func RegisterHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)
		var req AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			handleError(w, err)
			return
		}

		if err := validateUsername(req.Username); err != nil {
			handleError(w, err)
			return
		}

		if err := validatePassword(req.Password); err != nil {
			handleError(w, err)
			return
		}

		existingUser, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			handleError(w, err)
			return
		}

		if existingUser != nil {
			handleError(w, ErrUsernameAlreadyTaken)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			handleError(w, err)
			return
		}

		user := &models.User{
			ID:           uuid.New(),
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			IsAdmin:      false,
		}

		if err := db.CreateUser(dbConn, user); err != nil {
			handleError(w, err)
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			handleError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			handleError(w, err)
		}
	}
}

func LoginHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)
		var req AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			handleError(w, err)
			return
		}

		user, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			handleError(w, err)
			return
		}
		if user == nil {
			handleError(w, ErrInvalidCredentials)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			handleError(w, ErrInvalidCredentials)
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			handleError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			handleError(w, err)
		}
	}
}

func RefreshHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			RefreshToken string `json:"refresh_token"`
		}

		cfg := middleware.GetConfig(r)

		if err := decodeJSON(r, &req); err != nil || req.RefreshToken == "" {
			handleError(w, errors.New("missing refresh token"))
			return
		}

		token, err := jwt.Parse(req.RefreshToken, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, ErrInvalidToken
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			handleError(w, ErrInvalidCredentials)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["type"] != RefreshTokenType {
			handleError(w, ErrInvalidCredentials)
			return
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			handleError(w, ErrInvalidCredentials)
			return
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			handleError(w, ErrInvalidCredentials)
			return
		}

		user, err := db.GetUserByID(dbConn, userID)
		if err != nil || user == nil {
			handleError(w, ErrInvalidCredentials)
			return
		}

		tokens, err := getTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			handleError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			handleError(w, err)
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

func handleError(w http.ResponseWriter, err error) {
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
