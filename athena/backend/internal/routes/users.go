package routes

import (
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/handlers/users"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	"github.com/go-chi/chi/v5"
)

func UsersRouter(app *config.App) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.WithConfig(app.Config))

	r.Post("/register", users.RegisterHandler(app.DB))
	r.Post("/login", users.LoginHandler(app.DB))

	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)

		r.Post("/logout", users.LogoutHandler)
		r.Get("/me", users.GetMeHandler(app.DB))
		r.Delete("/me", users.DeleteMeHandler(app.DB))
	})

	return r
}
