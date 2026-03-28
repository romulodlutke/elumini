import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export interface JWTPayload {
  sub: string      // userId
  email: string
  role: string
  name: string
  iat?: number
  exp?: number
}

// ==========================================
// GERAÇÃO DE TOKENS
// ==========================================

export async function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
    .sign(JWT_REFRESH_SECRET)
}

// ==========================================
// VERIFICAÇÃO DE TOKENS
// ==========================================

/** Formato compacto mínimo JWT (evita chamar jose com string vazia/lixo → "Invalid Compact JWS"). */
function looksLikeCompactJwt(token: string): boolean {
  const t = token.trim()
  if (t.length < 20) return false
  const parts = t.split('.')
  return parts.length === 3 && parts.every((p) => p.length > 0)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  const t = token.trim()
  if (!t || !looksLikeCompactJwt(t)) return null
  try {
    const { payload } = await jwtVerify(t, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  const t = token.trim()
  if (!t || !looksLikeCompactJwt(t)) return null
  try {
    const { payload } = await jwtVerify(t, JWT_REFRESH_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ==========================================
// UTILITÁRIOS DE SESSÃO
// ==========================================

export async function getSessionFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const bearerToken = authHeader.slice(7).trim()
    if (bearerToken && looksLikeCompactJwt(bearerToken)) {
      const fromBearer = await verifyAccessToken(bearerToken)
      if (fromBearer) return fromBearer
    }
    // Bearer vazio, inválido ou expirado: ainda tentar cookie (evita bloquear upload quando o Zustand tem lixo em memória)
  }

  const cookieStore = cookies()
  const cookieToken = cookieStore.get('access_token')?.value
  if (cookieToken) {
    return verifyAccessToken(cookieToken)
  }

  return null
}

export async function getServerSession(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  return verifyAccessToken(token)
}

// ==========================================
// GERENCIAMENTO DE REFRESH TOKENS NO DB
// ==========================================

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 dias

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  })
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  })

  if (!storedToken) return false
  if (storedToken.revoked) return false
  if (storedToken.expiresAt < new Date()) return false

  return true
}

// ==========================================
// HELPERS DE COOKIE SEGURO
// ==========================================

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  }
}
