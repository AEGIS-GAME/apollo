package routes

import (
	"database/sql"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/handlers/users"
	"github.com/go-chi/chi/v5"
)

func UsersRouter(db *sql.DB, cfg *config.Config) chi.Router {
	r := chi.NewRouter()

	r.Post("/register", users.RegisterHandler(db, cfg))
	r.Post("/login", users.LoginHandler(db, cfg))

	return r
}
