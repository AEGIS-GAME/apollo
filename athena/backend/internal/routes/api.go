package routes

import (
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/go-chi/chi/v5"
)

func APIRouter(app *config.App) chi.Router {
	r := chi.NewRouter()

	r.Mount("/users", UsersRouter(app))

	return r
}
