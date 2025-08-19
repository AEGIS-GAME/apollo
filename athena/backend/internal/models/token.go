package models

import (
	"time"

	s "github.com/AEGIS-GAME/apollo/athena/backend/shared"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type TokenPair struct {
	Access  string
	Refresh string
}

const (
	AccessTokenDuration  = 1 * time.Minute
	RefreshTokenDuration = 7 * 24 * time.Hour
	RefreshTokenType     = "refresh"
)

func GetTokenPair(userID uuid.UUID, jwtSecret string) (*TokenPair, error) {
	accessToken, err := GenerateToken(userID, jwtSecret, AccessTokenDuration, "")
	if err != nil {
		return nil, err
	}

	refreshToken, err := GenerateToken(userID, jwtSecret, RefreshTokenDuration, RefreshTokenType)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		Access:  accessToken,
		Refresh: refreshToken,
	}, nil
}

func GenerateToken(userID uuid.UUID, jwtSecret string, duration time.Duration, tokenType string) (string, error) {
	if jwtSecret == "" {
		return "", s.ErrMissingJWTSecret
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"exp":     now.Add(duration).Unix(),
		"iat":     now.Unix(),
	}

	if tokenType != "" {
		claims["type"] = tokenType
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtSecret))
}
