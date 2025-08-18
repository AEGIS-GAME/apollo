import { useMutation } from "@tanstack/react-query";
import { login, logout, register } from "../api/user/auth";
import { useAuthStore } from "@/stores/authStore";

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      register(username, password),
    onSuccess: (userData) => {
      const normalized = {
        id: userData.id,
        username: userData.username,
        isAdmin: userData.is_admin,
      }
      setUser(normalized)
    }
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (userData) => {
      const normalized = {
        id: userData.id,
        username: userData.username,
        isAdmin: userData.is_admin,
      }
      setUser(normalized)
    }
  })
}

export function useLogout() {
  const clearUser = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => clearUser()
  });
}
