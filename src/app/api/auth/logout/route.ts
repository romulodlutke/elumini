import { NextRequest, NextResponse } from 'next/server'
import { revokeRefreshToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (refreshToken) {
      await revokeRefreshToken(refreshToken)
    }

    const response = NextResponse.json({ success: true, message: 'Logout realizado com sucesso' })
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
  } catch (error) {
    console.error('[LOGOUT]', error)
    return NextResponse.json({ success: false, error: 'Erro ao fazer logout' }, { status: 500 })
  }
}
