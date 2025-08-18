import { useMutation } from "@tanstack/react-query";
import { login, logout, register } from "../api/user/auth";
import { useAuthStore } from "@/stores/authStore";

export function useRegister() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      register(username, password),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  })
}

export function useLogout() {
  const clearUser = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => clearUser()
  });
}
