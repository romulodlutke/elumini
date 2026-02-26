import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, generateRefreshToken, saveRefreshToken, getAuthCookieOptions } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = loginSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validated.data

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos' },
        { status: 401 }
      )
    }

    if (!user.active) {
      return NextResponse.json(
        { success: false, error: 'Sua conta está desativada. Entre em contato com o suporte.' },
        { status: 403 }
      )
    }

    const tokenPayload = { sub: user.id, email: user.email, role: user.role, name: user.name }
    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    await saveRefreshToken(user.id, refreshToken)

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
        accessToken,
      },
    })

    const cookieOptions = getAuthCookieOptions()
    response.cookies.set('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 })
    response.cookies.set('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 })

    return response
  } catch (error) {
    console.error('[LOGIN]', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
