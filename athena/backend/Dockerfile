FROM golang:1.24-alpine AS builder

ENV CGO_ENABLED=1

WORKDIR /app

# Install build dependencies
RUN apk update && apk add --no-cache git build-base sqlite-dev

# Copy modules and download
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Install Air for live reload
RUN go install github.com/air-verse/air@latest

EXPOSE 8000

CMD ["air", "-build.cmd", "go run ./cmd/server"]
