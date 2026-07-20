import { create } from 'zustand'

type SessionState = {
  userId: string | null
  sessionId: string | null
  expiresAt: string | null
  setSession: (session: {
    userId: string
    sessionId: string
    expiresAt: string
  }) => void
}

export const useAuthStore = create<SessionState>((set) => ({
  userId: null,
  sessionId: null,
  expiresAt: null,
  setSession: (session) => set(session),
}))
