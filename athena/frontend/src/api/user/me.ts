import type { DeleteResponse, User } from "@/types/user";
import { apiFetch } from "../client";

export async function getCurrentUser() {
  return apiFetch<User>("/users/me", {
    method: "GET",
  });
}

export async function deleteCurrentUser() {
  return apiFetch<DeleteResponse>("/users/me", {
    method: "DELETE",
  });
}
