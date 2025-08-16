FROM golang:1.24-alpine

RUN go install github.com/air-verse/air@latest

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8000

CMD ["air", "-build.cmd", "go run ./cmd/server"]
