export interface User {
  id: string
  username: string
  is_admin: boolean
}

export interface MessageResponse {
  message: string
}

export interface LoginCredentials {
  username: string
  password: string
}

// This will prob be updated in the future
export interface RegisterCredentials {
  username: string
  password: string
}
