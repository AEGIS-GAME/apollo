// routes/match.go
package routes

import (
	"github.com/AEGIS-GAME/apollo/athena/backend/handlers"
	"github.com/go-chi/chi/v5"
)

func RegisterMatchRoutes(r chi.Router) {
	r.Route("/match", func(r chi.Router) {
		r.Post("/run", handlers.RunMatch)
	})
}
