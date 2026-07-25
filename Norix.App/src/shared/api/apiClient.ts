export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json() as Promise<TResponse>
}

export class ApiError extends Error {
  public readonly status: number
  public readonly body: string

  constructor(status: number, body: string) {
    super(`API request failed with status ${status}`)
    this.status = status
    this.body = body
  }
}
