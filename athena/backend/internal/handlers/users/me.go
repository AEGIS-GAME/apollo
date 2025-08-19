package users

import (
	"database/sql"
	"net/http"

	"github.com/AEGIS-GAME/apollo/athena/backend/internal/db"
	"github.com/AEGIS-GAME/apollo/athena/backend/middleware"
	s "github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/google/uuid"
)

func GetMeHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := middleware.ExtractClaims(r)
		if !ok {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		user, err := db.GetUserByID(dbConn, userID)
		if err != nil || user == nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		s.RespondWithJSON(w, http.StatusOK, user)
	}
}

func DeleteMeHandler(dbConn *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := middleware.ExtractClaims(r)
		if !ok {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}

		userIDStr, ok := claims["user_id"].(string)
		if !ok {
			s.HandleError(w, s.ErrInvalidToken)
			return
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		err = db.DeleteUserByID(dbConn, userID)
		if err != nil {
			s.HandleError(w, s.ErrInvalidCredentials)
			return
		}

		s.RespondWithJSON(w, http.StatusOK, map[string]string{
			"message": "Account deleted successfully",
		})
	}
}
