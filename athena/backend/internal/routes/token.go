package routes

import (
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/handlers/token"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	"github.com/go-chi/chi/v5"
)

func TokenRouter(app *config.App) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.WithConfig(app.Config))

	r.Get("/refresh", token.RefreshHandler(app.DB))
	r.Post("/verify", token.VerifyHandler())

	return r
}
