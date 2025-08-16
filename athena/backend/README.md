# Athena Backend API

This document describes the available endpoints for the Athena backend. It covers the **User API** for now,
but additional endpoints will be added in the future.

## Table of Contents

- [Setup](#setup)
- [Api Endpoints](#api-endpoints)
    - [User API](#user-api)
      - [Register a New User](#register-a-new-user)
      - [Login](#login)
      - [Get Current User](#get-current-user)
      - [Delete Account](#delete-account)
    - [Admin Endpoints](#admin-endpoints)
      - [List All Users](#list-all-users)
      - [Promote User to Admin](#promote-user-to-admin)
      - [Delete User](#delete-user)

---

## Setup

### Prerequisites

- Go 1.25+
- Postgres or SQLite for local development

### Steps

1. Navigate to the `athena/backend` directory:

```bash
cd athena/backend
```

2. Install dependencies:

```bash
go mod tidy
```

3. Install `golang-migrate`

We use `golang-migrate` for database migrations.
Install it with support for both SQLite and Postgres:

```bash
go install -tags 'sqlite3 sqlite postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

This will install the `migrate` CLI into yout `$GOBIN` (usually `~/go/bin`).

4. Run the database migrations:

For SQLite (development):

```bash
migrate -path migrations -database sqlite3://dev.db -verbose up
```

If you need to reset your local DB completely (drops all tables):

```bash
migrate -path migrations -database sqlite3://dev.db -verbose down
```

5. Start the server:

```bash
go run cmd/server/main.go
```

or use `air` for live reload:

```bash
air -build.cmd "go run ./cmd/server"
```

The API will be available at `http://localhost:8000`

## API Endpoints

### User API

#### Register a New User

- **Endpoint:** `POST /api/users/register`
- **Description:** Creates a new user account.
- **Request Example:**
```json
{
  "username": "alice",
  "password": "secret"
}
```

- **Response Example:**

```json
{
  "token": "<jwt_token>"
}
```

#### Login

- **Endpoint:** `POST /api/users/login`
- **Description:** Authenticates a user and returns an authentication token.
- **Request Example:**

```json
{
  "username": "alice",
  "password": "secret"
}
```

- **Response Example:**

```json
{
  "token": "<jwt_token>"
}
```

#### Get Current User

- **Endpoint:** `GET /api/users/me`
- **Description:** Returns details of the currently authenticated user.
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

```json
{
  "id": 1,
  "username": "alice",
  "is_admin": false
}
```

#### Delete Account

- **Endpoint:** `DELETE /api/users/me`
- **Description:** Permanently deletes the authenticated user’s account.
- **Headers:** `Authorization: Bearer <token>`
- **Response Example:**

```json
{
  "message": "Account deleted successfully"
}
```


### Admin Endpoints

#### List All Users

- **Endpoint:** `GET /api/admin/users`
- **Description:** Returns a list of all users.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Example:**

```json
[
  {"id": 1, "username": "alice", "is_admin": false},
  {"id": 2, "username": "bob", "is_admin": true}
]
```

#### Promote User to Admin

- **Endpoint:** `POST /api/admin/users/{id}/promote`
- **Description:** Grants admin privileges to a user.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Example:** Updated user object with `is_admin: true`.

#### Delete User

- **Endpoint:** `DELETE /api/admin/users/{id}`
- **Description:** Permanently deletes a user account.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response Example:**

```json
{
  "message": "User deleted successfully"
}
```
