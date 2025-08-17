package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
)

const claimsKey contextKey = "claims"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var tokenStr string
		cfg := GetConfig(r)

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

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			ctx := context.WithValue(r.Context(), claimsKey, claims)
			r = r.WithContext(ctx)
		} else {
			shared.RespondWithError(w, http.StatusUnauthorized, "invalid token claims")
			return
		}

		next.ServeHTTP(w, r)
	})
}

func ExtractClaims(r *http.Request) (jwt.MapClaims, bool) {
	claims, ok := r.Context().Value(claimsKey).(jwt.MapClaims)
	return claims, ok
}
