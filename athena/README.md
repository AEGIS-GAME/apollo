# Athena

This is the Aegis competitive web platform.

## Development Setup

You can get started locally using Docker Compose. This will spin up both the frontend and backend together.

### Prerequisites

- Docker
- Docker Compose

### Run Locally

1. Navigate to the `athena` directory:

```bash
cd athena
```

2. Set up the backend:

Follow the steps in the [backend setup guide](https://github.com/AEGIS-GAME/apollo/tree/main/athena/backend#setup).

3. Start the services:

```bash
docker compose up -d
```

This will:

- Build Docker images for both frontend and backend if they don’t exist.
- Mount your local code into the containers so changes are reflected immediately.
- Start the backend on `http://localhost:8000`
- Start the frontend website on `http://localhost:3000`

### Healthcheck

The backend exposes a `/health` endpoint to verify it’s running:

```bash
curl http://localhost:8000/health
```

### View Logs

To see logs from all services:

```bash
docker compose logs -f
```

Or for a specific service, e.g., backend:

```bash
docker compose logs -f backend
```

### Rebuild a Single Service

If you make changes to dependencies or Dockerfiles:

```bash
docker compose build backend
docker compose up -d backend
```

### Stop the Services

```bash
docker compose down
```
