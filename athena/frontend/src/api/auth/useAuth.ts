import { QueryClient, useMutation } from "@tanstack/react-query"
import { UserApi, TokenApi } from ".."
import type { LoginCredentials } from "../models/User"

const USER_API = new UserApi()
const TOKEN_API = new TokenApi()

export function useRegister() {
  return useMutation({
    mutationFn: ({
      username,
      password,
    }: { username: string; password: string }) =>
      USER_API.register(username, password),
    onSuccess: (userData) => {
      const normalized = {
        id: userData.id,
        username: userData.username,
        isAdmin: userData.is_admin,
      }
      console.log(normalized)
    },
  })
}

export function useLogin(queryClient: QueryClient) {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await USER_API.login(credentials)
      queryClient.setQueryData<boolean>(["loggedIn"], true)
    },
  })
}

export function useLogout(queryClient: QueryClient) {
  return useMutation({
    mutationFn: () => USER_API.logout(),
    onSuccess: () => {
      queryClient.setQueryData<boolean>(["loggedIn"], false)
    },
  })
}

export async function tokenVerify(): Promise<boolean> {
  try {
    await TOKEN_API.verifyToken()
    return true
  } catch {
    return false
  }
}
