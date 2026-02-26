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
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '15m')
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

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
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
    const token = authHeader.substring(7)
    return verifyAccessToken(token)
  }

  // Fallback para cookie httpOnly (usado em server components)
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')?.value
  if (token) {
    return verifyAccessToken(token)
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
