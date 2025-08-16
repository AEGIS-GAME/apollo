package main

import (
	"log"
	"net/http"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env.development")

	db.InitDB()
	defer db.DB.Close()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/status", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	log.Printf("Server listening on :8000")
	http.ListenAndServe(":8000", r)
}
