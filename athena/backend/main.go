package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Could not parse form", http.StatusBadRequest)
		return
	}

	saveFile := func(fieldName string) error {
		file, header, err := r.FormFile(fieldName)
		if err != nil {
			if err == http.ErrMissingFile {
				return nil
			}
			return err
		}
		defer file.Close()

		dstPath := filepath.Join("uploads", header.Filename)
		os.MkdirAll("uploads", os.ModePerm)

		dst, err := os.Create(dstPath)
		if err != nil {
			return err
		}
		defer dst.Close()

		_, err = io.Copy(dst, file)
		return err
	}

	if err := saveFile("world"); err != nil {
		http.Error(w, fmt.Sprintf("Failed to save world file: %v", err), http.StatusInternalServerError)
		return
	}

	if err := saveFile("agent"); err != nil {
		http.Error(w, fmt.Sprintf("Failed to save agent file: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `{"status":"success"}`)
}

func main() {
	http.HandleFunc("/api/upload", uploadHandler)

	fmt.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
