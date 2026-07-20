import { z } from 'zod'
import { apiFetch } from '../../lib/apiClient'

export const loginRequestSchema = z.object({
  email: z.email('Escribe un correo valido.'),
  password: z.string().min(1, 'Escribe tu password.'),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export type LoginResponse = {
  userId: string
  sessionId: string
  expiresAt: string
}

export function login(request: LoginRequest) {
  return apiFetch<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  })
}
