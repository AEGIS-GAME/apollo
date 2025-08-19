const API_URL = import.meta.env.VITE_BACKEND_URL

export default class Api {
  private refreshing: Promise<void> | null = null

  public get<T>(endpoint: string): Promise<T> {
    return this.req<T>("GET", endpoint)
  }

  public post<T>(endpoint: string, body?: any): Promise<T> {
    return this.req<T>("POST", endpoint, body)
  }

  public delete<T>(endpoint: string): Promise<T> {
    return this.req<T>("DELETE", endpoint)
  }

  private async refreshTokens() {
    const res = await fetch(`${API_URL}/api/token/refresh`, {
      method: "GET",
      credentials: "include",
    })
    if (!res.ok) throw new Error("Refresh token invalid")
  }

  private async req<T>(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<T> {
    const doFetch = async (): Promise<Response> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      let reqBody: string | undefined
      if (body && typeof body !== "string") reqBody = JSON.stringify(body)
      else reqBody = body

      return fetch(`${API_URL}/api${endpoint}`, {
        method,
        headers,
        body: reqBody,
        credentials: "include",
      })
    }

    let res = await doFetch()

    // handle 401 once
    if (res.status === 401) {
      if (!this.refreshing) {
        this.refreshing = this.refreshTokens().finally(
          () => (this.refreshing = null),
        )
      }

      try {
        await this.refreshing
      } catch {
        await fetch(`${API_URL}/api/users/logout`, {
          method: "POST",
          credentials: "include",
        })
        throw new Error("Session expired, please log in again")
      }

      res = await doFetch()

      if (res.status === 401) {
        await fetch(`${API_URL}/api/users/logout`, {
          method: "POST",
          credentials: "include",
        })
        throw new Error("Session expired, please log in again")
      }
    }

    if (res.status === 204 || res.headers.get("content-length") === "0")
      return {} as T

    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.error || `API Error: ${res.status}`)
    return data
  }
}
