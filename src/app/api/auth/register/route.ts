export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
  country: z.string().optional(),
  professionalName: z.string().optional(),
  nationality: z.string().optional(),
  documentId: z.string().optional(),
  languages: z.array(z.string()).optional(),
  bio: z.string().optional(),
  whatsapp: z.string().optional(),
  professionalEmail: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  // Data de nascimento (terapeuta ou paciente)
  birthDate: z.string().optional(),
  // Campos opcionais do paciente
  anamnese: z.record(z.unknown()).optional(),
  gender: z.enum(['MASCULINO', 'FEMININO', 'NAO_BINARIO', 'PREFIRO_NAO_INFORMAR']).optional(),
})

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('[REGISTER] Missing JWT_SECRET or JWT_REFRESH_SECRET')
    return NextResponse.json(
      { success: false, error: 'Erro de configuração do servidor. Tente novamente mais tarde.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const validated = registerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, therapies, price, modality, location, city, state, country, professionalName, nationality, documentId, languages, bio, whatsapp, professionalEmail, instagram, facebook, websiteUrl, anamnese, gender, birthDate } = validated.data

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
        ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
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
              country: country || null,
              professionalName: professionalName || null,
              nationality: nationality || null,
              documentId: documentId || null,
              languages: languages?.length ? languages : ['Português'],
              whatsapp: whatsapp || null,
              professionalEmail: professionalEmail || null,
              instagram: instagram || null,
              facebook: facebook || null,
              websiteUrl: websiteUrl || null,
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
        title: 'Bem-vindo ao EALumini!',
        message: role === 'TERAPEUTA'
          ? 'Seu cadastro foi recebido. Aguarde a aprovação da equipe EALumini para começar a atender.'
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
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[REGISTER]', err.message, err.stack)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}
