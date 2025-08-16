# Athena Backend API

This document describes the available endpoints for the Athena backend. It covers the **User API** for now,
but additional endpoints will be added in the future.

## User API

### Register a New User

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

### Login

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

### Get Current User

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
- **Response:** Updated user object with `is_admin: true`.

#### Deactivate User

- **Endpoint:** `POST /api/admin/users/{id}/deactivate`
- **Description:** Deactivates a user account.
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:** Updated user object with `active: false`.
