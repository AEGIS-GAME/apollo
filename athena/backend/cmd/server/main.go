package main

import (
	"log"
	"net/http"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/config"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/internal/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	cfg := config.Load()
	db.InitDB(cfg)
	defer db.DB.Close()

	app := &config.App{
		Config: cfg,
		DB:     db.DB,
	}

	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	apiRouter := routes.APIRouter(app)

	r.Mount("/api", apiRouter)
	r.Mount("/health", routes.HealthRouter())

	log.Printf("Server listening on :8000")
	http.ListenAndServe(":8000", r)
}
