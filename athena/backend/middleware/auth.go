package middleware

import (
	"net/http"
	"strings"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(next http.Handler, cfg *config.Config) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string

		if cookie, err := r.Cookie("access_token"); err == nil {
			tokenStr = cookie.Value
		}

		if len(tokenStr) == 0 {
			authHeader := r.Header.Get("Authorization")
			if len(authHeader) == 0 {
				shared.RespondWithError(w, http.StatusUnauthorized, "missing Authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				shared.RespondWithError(w, http.StatusBadRequest, "invalid Authorization header format")
				return
			}
			tokenStr = parts[1]
		}

		if cfg.JWTSecret == "" {
			shared.RespondWithError(w, http.StatusInternalServerError, "server misconfiguration")
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			shared.RespondWithError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		next.ServeHTTP(w, r)
	})
}
