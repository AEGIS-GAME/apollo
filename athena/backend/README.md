# Athena Backend API

This document describes the available endpoints for the Athena backend. It covers the **User API** for now,
but additional endpoints will be added in the future.

## Table of Contents

- [Setup](#setup)
- [Api Endpoints](#api-endpoints)
    - [Users API](#user-api)
      - [Register a New User](#register-a-new-user)
      - [Login](#login)
      - [Logout](#logout)
      - [Get Current User](#get-current-user)
      - [Delete Account](#delete-account)
    - [Token API](#token-api)
      - [Validate](#validate)
      - [Refresh](#refresh)
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

> [!NOTE]
> If you make any changes to the backend code, you will need to stop and rerun this command to see updates. 

If you want live reload, you can use [Air](https://github.com/air-verse/air):

```bash
go install github.com/air-verse/air@latest
air -build.cmd go run ./cmd/server
```

If the port ever gets stuck, kill it with:

```bash
lsof -ti tcp:8000 | xargs kill -9
```

The API will be available at `http://localhost:8000`.

## API Endpoints

> [!NOTE]
> All authentication is handled via **HttpOnly cookies** (`access_token` and `refresh_token`).
> Clients do not need to manually send `Authorization: Bearer` headers.
> Make sure to include `credentials: "include"` on all fetch requests from the frontend so cookies are sent automatically.


### User API

#### Register a New User

- **Endpoint:** `POST /api/users/register`
- **Description:** Creates a new user account. Sets authentication cookies (`access_token` and `refresh_token`)
and returns user info.
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
  "id": "uuid-here",
  "username": "alice",
  "is_admin": false
}
```

#### Login

- **Endpoint:** `POST /api/users/login`
- **Description:** Authenticates a user. Sets authentication cookies (`access_token` and `refresh_token`)
and returns user info.
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
  "id": "uuid-here",
  "username": "alice",
  "is_admin": false
}
```

#### Logout

- **Endpoint:** `POST /api/users/logout`
- **Description:** Logs out the authenticated user by clearing authentication cookies (`access_token` and `refresh_token`).
- **Response Example:**

```json
{
  "message": "Logged out successfully"
}
```

#### Refresh Access Token

- **Endpoint:** `GET /api/users/refresh`
- **Description:** Uses the refresh token cookie to issue new cookies (`access_token` and `refresh_token`). Returns user info.
- **Response Example:**

```json
{
  "id": "uuid-here",
  "username": "alice",
  "is_admin": false
}
```

#### Get Current User

- **Endpoint:** `GET /api/users/me`
- **Description:** Returns details of the currently authenticated user. Authentication is handled via cookies.
- **Response Example:**

```json
{
  "id": "uuid-here",
  "username": "alice",
  "is_admin": false
}
```

#### Delete Account

- **Endpoint:** `DELETE /api/users/me`
- **Description:** Permanently deletes the authenticated user’s account. Requires authentication cookies.
- **Response Example:**

```json
{
  "message": "Account deleted successfully"
}
```

### Admin Endpoints

#### List All Users

- **Endpoint:** `GET /api/admin/users`
- **Description:** Returns a list of all users. Admin authentication is handled via cookies (`access_token`).
- **Response Example:**

```json
[
  {"id": 1, "username": "alice", "is_admin": false},
  {"id": 2, "username": "bob", "is_admin": true}
]
```

#### Promote User to Admin

- **Endpoint:** `POST /api/admin/users/{id}/promote`
- **Description:** Grants admin privileges to a user. Admin authentication is handled via cookies (`access_token`).
- **Response Example:**

```json
{
  "id": "uuid-here",
  "username": "alice",
  "is_admin": true
}
```

#### Delete User

- **Endpoint:** `DELETE /api/admin/users/{id}`
- **Description:** Permanently deletes a user account. Admin authentication is handled via cookies (`access_token`).
- **Response Example:**

```json
{
  "message": "User deleted successfully"
}
```
