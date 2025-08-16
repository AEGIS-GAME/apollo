package main

import (
	"log"
	"net/http"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	db.InitDB()
	defer db.DB.Close()

	r := chi.NewRouter()

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	// Unprotected routes
	r.Group(func(r chi.Router) {
		r.Get("/status", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("ok"))
		})
	})

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.AuthMiddleware)
	})

	log.Printf("Server listening on :8000")
	http.ListenAndServe(":8000", r)
}
