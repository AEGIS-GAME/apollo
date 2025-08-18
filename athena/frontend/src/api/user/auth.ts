import type { DeleteResponse, User } from "@/types/user";
import { apiFetch } from "../client";

export async function register(username: string, password: string) {
  return apiFetch<User>("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function login(username: string, password: string) {
  return apiFetch<User>("/users/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  return apiFetch<DeleteResponse>("/users/logout", {
    method: "POST",
  });
}
