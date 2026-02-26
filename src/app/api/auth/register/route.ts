import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, generateRefreshToken, saveRefreshToken, getAuthCookieOptions } from '@/lib/auth'
import { Role } from '@prisma/client'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  role: z.enum(['TERAPEUTA', 'PACIENTE']),
  // Campos opcionais do terapeuta
  therapies: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
  modality: z.enum(['ONLINE', 'PRESENCIAL', 'AMBOS']).optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bio: z.string().optional(),
  // Campos opcionais do paciente
  anamnese: z.record(z.unknown()).optional(),
  gender: z.enum(['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'PREFIRO_NAO_INFORMAR']).optional(),
  birthDate: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, therapies, price, modality, location, city, state, bio, anamnese, gender, birthDate } = validated.data

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este e-mail já está cadastrado' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Criar usuário com perfil correspondente à role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        ...(role === 'TERAPEUTA' && {
          therapistProfile: {
            create: {
              bio: bio || '',
              therapies: therapies || [],
              price: price || 0,
              modality: (modality as any) || 'AMBOS',
              location: location || '',
              city: city || '',
              state: state || '',
              approved: false,
            },
          },
        }),
        ...(role === 'PACIENTE' && {
          patientProfile: {
            create: {
              gender: gender as any || undefined,
              birthDate: birthDate ? new Date(birthDate) : undefined,
              anamnese: (anamnese || {}) as any,
            },
          },
        }),
      },
    })

    // Gerar tokens
    const tokenPayload = { sub: user.id, email: user.email, role: user.role, name: user.name }
    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    await saveRefreshToken(user.id, refreshToken)

    // Notificação de boas-vindas
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bem-vindo ao HolosConnect!',
        message: role === 'TERAPEUTA'
          ? 'Seu cadastro foi recebido. Aguarde a aprovação da equipe HolosConnect para começar a atender.'
          : 'Sua conta foi criada com sucesso. Explore os terapeutas disponíveis e agende sua primeira sessão!',
        type: 'SUCCESS',
      },
    })

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
          accessToken,
        },
        message: 'Conta criada com sucesso!',
      },
      { status: 201 }
    )

    const cookieOptions = getAuthCookieOptions()
    response.cookies.set('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 })
    response.cookies.set('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 })

    return response
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
