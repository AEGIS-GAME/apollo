import { create } from "zustand";

interface AuthState {
  user: {
    id: string
    username: string
    isAdmin: boolean
  } | null
  setUser: (user: AuthState["user"]) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
