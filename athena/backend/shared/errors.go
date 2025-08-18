package shared

import (
	"errors"
	"net/http"
)

var (
	ErrMissingJWTSecret     = errors.New("JWT_SECRET environment variable not set")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUsernameAlreadyTaken = errors.New("username already taken")
	ErrInvalidUsername      = errors.New("invalid username")
	ErrWeakPassword         = errors.New("password too weak")
	ErrMissingRefreshToken  = errors.New("missing refresh token")
	ErrInvalidToken         = errors.New("invalid token")
)

func HandleError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrInvalidCredentials):
		RespondWithError(w, http.StatusUnauthorized, "invalid credentials")
	case errors.Is(err, ErrUsernameAlreadyTaken):
		RespondWithError(w, http.StatusConflict, "username already taken")
	case errors.Is(err, ErrWeakPassword):
		RespondWithError(w, http.StatusBadRequest, "password too weak")
	case errors.Is(err, ErrMissingJWTSecret):
		RespondWithError(w, http.StatusInternalServerError, "misconfigured server")
	case errors.Is(err, ErrInvalidToken):
		RespondWithError(w, http.StatusUnauthorized, "invalid, missing or expired token")
	default:
		RespondWithError(w, http.StatusInternalServerError, "server error")
	}
}
