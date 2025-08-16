package routes

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func HealthRouter() chi.Router {
	r := chi.NewRouter()
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("ok"))
	})
	return r
}
