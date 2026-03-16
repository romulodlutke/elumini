export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
  getAuthCookieOptions,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('[REFRESH] Missing JWT_SECRET or JWT_REFRESH_SECRET')
    return NextResponse.json(
      { success: false, error: 'Erro de configuração do servidor. Tente novamente mais tarde.' },
      { status: 503 }
    )
  }

  try {
    const refreshToken =
      request.cookies.get('refresh_token')?.value ||
      (await request.json().catch(() => ({}))).refreshToken

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'Refresh token não fornecido' }, { status: 401 })
    }

    const isValid = await isRefreshTokenValid(refreshToken)
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Refresh token inválido ou expirado' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshToken)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || !user.active) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado ou inativo' }, { status: 401 })
    }

    // Rotação de refresh token (segurança: revogar o antigo, emitir novo)
    await revokeRefreshToken(refreshToken)

    const tokenPayload = { sub: user.id, email: user.email, role: user.role, name: user.name }
    const newAccessToken = await generateAccessToken(tokenPayload)
    const newRefreshToken = await generateRefreshToken(tokenPayload)

    await saveRefreshToken(user.id, newRefreshToken)

    const response = NextResponse.json({
      success: true,
      data: { accessToken: newAccessToken },
    })

    const cookieOptions = getAuthCookieOptions()
    response.cookies.set('access_token', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 })
    response.cookies.set('refresh_token', newRefreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 })

    return response
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[REFRESH]', err.message, err.stack)
    return NextResponse.json({ success: false, error: 'Erro ao renovar token' }, { status: 500 })
  }
}
