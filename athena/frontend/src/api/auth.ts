import { apiFetch } from "./client";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function register(username: string, password: string) {
  return apiFetch<LoginResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
