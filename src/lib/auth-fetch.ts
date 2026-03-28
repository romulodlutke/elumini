import { useAuthStore } from '@/hooks/useAuth'

function looksLikeCompactJwt(token: string): boolean {
  const t = token.trim()
  if (t.length < 20) return false
  const parts = t.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}

/**
 * Merge Authorization + credentials. Só envia Bearer se parecer JWT válido;
 * senão o servidor usa o cookie httpOnly (evita "Invalid Compact JWS" no Supabase/auth com token corrompido).
 */
export function withAuth(init: RequestInit = {}): RequestInit {
  const token = useAuthStore.getState().accessToken?.trim()
  const headers = new Headers(init.headers ?? {})
  if (token && looksLikeCompactJwt(token)) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return {
    ...init,
    credentials: 'include',
    headers,
  }
}
