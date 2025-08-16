package routes

import (
	"database/sql"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/go-chi/chi/v5"
)

func APIRouter(dbConn *sql.DB, cfg *config.Config) chi.Router {
	r := chi.NewRouter()

	r.Mount("/users", UsersRouter(dbConn, cfg))

	return r
}
