package middleware

import (
	"context"
	"net/http"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
)

type contextKey string

const cfgKey = contextKey("config")

func WithConfig(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), cfgKey, cfg)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetConfig(r *http.Request) *config.Config {
	if cfg, ok := r.Context().Value(cfgKey).(*config.Config); ok {
		return cfg
	}
	return nil
}
