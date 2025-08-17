package routes

import (
	"database/sql"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/handlers/users"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	"github.com/go-chi/chi/v5"
)

func UsersRouter(db *sql.DB, cfg *config.Config) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.WithConfig(cfg))

	r.Post("/register", users.RegisterHandler(db))
	r.Post("/login", users.LoginHandler(db))
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
		r.Get("/me", users.MeHandler(db))
		r.Post("/refresh", users.RefreshHandler(db))

	})

	return r
}
