CREATE TABLE IF NOT exists users (
    id TEXT PRIMARY KEY, -- UUID stored as string
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);
