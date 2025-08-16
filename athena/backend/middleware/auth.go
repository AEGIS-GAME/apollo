package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			shared.RespondWithError(w, http.StatusUnauthorized, "missing Authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			shared.RespondWithError(w, http.StatusBadRequest, "invalid Authorization header format")
			return
		}

		tokenStr := parts[1]
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			shared.RespondWithError(w, http.StatusInternalServerError, "server misconfiguration")
			return
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (any, error) {
			return secret, nil
		})

		if err != nil || !token.Valid {
			shared.RespondWithError(w, http.StatusUnauthorized, "invalid token")
		}

		next.ServeHTTP(w, r)
	})
}
