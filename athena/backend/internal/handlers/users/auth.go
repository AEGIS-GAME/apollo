package users

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	m "github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	s "github.com/AEGIS-GAME/apollo/athena/backend/shared"
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

func decodeJSON(r *http.Request, dst any) error {
	return json.NewDecoder(r.Body).Decode(dst)
}

func respondWithAuth(w http.ResponseWriter, tokens *m.TokenPair, user *m.User) error {
	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    tokens.Access,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   int(AccessTokenDuration.Seconds()),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    tokens.Refresh,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		MaxAge:   int(RefreshTokenDuration.Seconds()),
	})

	response := m.UserInfo{
		ID:       user.ID,
		Username: user.Username,
		IsAdmin:  user.IsAdmin,
	}

	s.RespondWithJSON(w, http.StatusOK, response)
	return nil
}

func validatePassword(password string) error {
	if len(password) < MinPasswordLength {
		return s.ErrWeakPassword
	}
	return nil
}

func validateUsername(username string) error {
	var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	username = strings.TrimSpace(username)

	if len(username) == 0 || len(username) < MinUsernameLength || len(username) > MaxUsernameLength {
		return s.ErrInvalidUsername
	}

	if !usernameRegex.MatchString(username) {
		return s.ErrInvalidUsername
	}
	return nil
}

func RegisterHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)
		var req m.AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			s.HandleError(w, err)
			return
		}

		if err := validateUsername(req.Username); err != nil {
			s.HandleError(w, err)
			return
		}

		if err := validatePassword(req.Password); err != nil {
			s.HandleError(w, err)
			return
		}

		existingUser, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			s.HandleError(w, err)
			return
		}

		if existingUser != nil {
			s.HandleError(w, s.ErrUsernameAlreadyTaken)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			s.HandleError(w, err)
			return
		}

		user := &m.User{
			ID:           uuid.New(),
			Username:     req.Username,
			PasswordHash: string(hashedPassword),
			IsAdmin:      false,
		}

		if err := db.CreateUser(dbConn, user); err != nil {
			s.HandleError(w, err)
			return
		}

		tokens, err := m.GetTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			s.HandleError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			s.HandleError(w, err)
		}
	}
}

func LoginHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)
		var req m.AuthRequest
		if err := decodeJSON(r, &req); err != nil {
			s.HandleError(w, err)
			return
		}

		user, err := db.GetUserByUsername(dbConn, req.Username)
		if err != nil {
			s.HandleError(w, err)
			return
		}
		if user == nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		tokens, err := m.GetTokenPair(user.ID, cfg.JWTSecret)
		if err != nil {
			s.HandleError(w, err)
			return
		}

		if err := respondWithAuth(w, tokens, user); err != nil {
			s.HandleError(w, err)
		}
	}
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	s.RespondWithJSON(w, http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
