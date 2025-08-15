package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
)

func RunMatch(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Failed to parse form")
		return
	}

	worldFile, _, err := r.FormFile("world")
	if err != nil {
		RespondWithError(w, http.StatusBadRequest, "Missing world file")
		return
	}
	defer worldFile.Close()

	worldData, err := io.ReadAll(worldFile)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to read world file")
		return
	}

	tmpWorld, err := os.CreateTemp("", "world-*.pb")
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create temp file")
		return
	}
	defer os.Remove(tmpWorld.Name())
	tmpWorld.Write(worldData)
	tmpWorld.Close()

	pythonFile, _, err := r.FormFile("agent")
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Missing agent file")
		return
	}
	defer pythonFile.Close()

	pythonData, err := io.ReadAll(pythonFile)
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to read agent file")
		return
	}

	tmpPython, err := os.CreateTemp("", "agent-*.py")
	if err != nil {
		RespondWithError(w, http.StatusInternalServerError, "Failed to create temp file")
		return
	}
	defer os.Remove(tmpPython.Name())
	tmpPython.Write(pythonData)
	tmpPython.Close()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
