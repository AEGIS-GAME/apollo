const API_URL = import.meta.env.VITE_BACKEND_URL

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options,
    credentials: "include",
  })

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `API Error: ${res.status}`)
  }
  return data
}
