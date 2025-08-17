import { apiFetch } from "./client";

export type Response = {
  accessToken: string;
  refreshToken: string;
};

export async function register(username: string, password: string) {
  return apiFetch<Response>("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string) {
  return apiFetch<Response>("/users/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
