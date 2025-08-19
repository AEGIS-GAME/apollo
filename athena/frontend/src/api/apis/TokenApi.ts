import Api from "../Api"

export class TokenApi extends Api {
  async verifyToken(): Promise<void> {
    await this.post<void>("/token/verify")
  }
}
