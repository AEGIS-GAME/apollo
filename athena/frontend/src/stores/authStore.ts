import { create } from "zustand"

interface AuthState {
  isLoggedIn: boolean
  setIsLoggedIn: (loggedIn: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
  logout: () => set({ isLoggedIn: false }),
}))
