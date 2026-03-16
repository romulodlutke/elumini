export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateAccessToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const resetSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
})

// Solicitar link de recuperação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = forgotSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: 'E-mail inválido' }, { status: 400 })
    }

    const { email } = validated.data
    const user = await prisma.user.findUnique({ where: { email } })

    // Retornar sucesso mesmo se não encontrar (evitar enumeração de usuários)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      })
    }

    // Gerar token de reset (válido por 1h)
    const resetToken = await generateAccessToken({
      sub: user.id,
      email: user.email,
      role: 'RESET',
      name: user.name,
    })

    // Em produção: enviar por email via Resend/Nodemailer
    // Por ora, retornamos o token para facilitar testes
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    console.log('[RESET PASSWORD URL]', resetUrl)

    return NextResponse.json({
      success: true,
      message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      // Remover em produção:
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    })
  } catch (error) {
    console.error('[FORGOT PASSWORD]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

// Redefinir senha
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = resetSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const { token, password } = validated.data

    // Verificar token (usamos verifyAccessToken com role RESET)
    const { verifyAccessToken } = await import('@/lib/auth')
    const payload = await verifyAccessToken(token)

    if (!payload || payload.role !== 'RESET') {
      return NextResponse.json({ success: false, error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso!' })
  } catch (error) {
    console.error('[RESET PASSWORD]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
