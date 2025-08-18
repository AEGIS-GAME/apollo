package token

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	m "github.com/AEGIS-GAME/apollo/athena/backend/internal/models"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	s "github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	AccessTokenDuration = 15 * time.Minute
	RefreshTokenType    = "refresh"
)

func RefreshHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)

		cookie, err := r.Cookie("refresh")
		if err != nil || cookie.Value == "" {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}
		refreshToken := strings.TrimSpace(cookie.Value)

		token, err := jwt.Parse(refreshToken, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, s.ErrInvalidToken
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || claims["type"] != RefreshTokenType {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		user, err := db.GetUserByID(dbConn, userID)
		if err != nil || user == nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		accessToken, err := m.GenerateToken(user.ID, cfg.JWTSecret, AccessTokenDuration, "")
		if err != nil {
			s.HandleError(w, err)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "access",
			Value:    accessToken,
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode,
			Path:     "/",
			MaxAge:   int(AccessTokenDuration.Seconds()),
		})

		response := m.UserInfo{
			ID:       user.ID,
			Username: user.Username,
			IsAdmin:  user.IsAdmin,
		}

		s.RespondWithJSON(w, http.StatusOK, response)
	}
}

func VerifyHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cfg := middleware.GetConfig(r)

		cookie, err := r.Cookie("access")
		if err != nil || cookie.Value == "" {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}
		accessToken := strings.TrimSpace(cookie.Value)

		token, err := jwt.Parse(accessToken, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, s.ErrInvalidToken
			}
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		if exp, ok := claims["exp"].(float64); ok {
			if time.Now().Unix() > int64(exp) {
				s.HandleError(w, s.ErrInvalidToken)
				return
			}
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
