import Api from "../Api"
import type { LoginCredentials, MessageResponse, User } from "../models/User"

export class UserApi extends Api {
  async register(credentials: LoginCredentials): Promise<User> {
    return await this.post<User>("/users/register", credentials)
  }

  async login(credentials: LoginCredentials): Promise<User> {
    return await this.post<User>("/users/login", credentials)
  }

  async logout(): Promise<MessageResponse> {
    return await this.post<MessageResponse>("/users/logout")
  }

  async getCurrentUser(): Promise<User> {
    return await this.get<User>("/users/me")
  }

  async deleteCurrentUser(): Promise<MessageResponse> {
    return await this.delete<MessageResponse>("/users/me")
  }
}
