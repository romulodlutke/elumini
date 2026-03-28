export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { jsonSafeSerialize } from '@/lib/json-safe'
import bcrypt from 'bcryptjs'
import type { Prisma } from '@prisma/client'

const anamnesisSchema = z.object({
  objetivo: z.string().max(8000).optional(),
  historicoEmocional: z.string().max(8000).optional(),
  medicamentos: z.string().max(4000).optional(),
  alergias: z.string().max(4000).optional(),
  expectativas: z.string().max(8000).optional(),
})

const putProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional().nullable(),
  anamnesis: anamnesisSchema.optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
})

function normalizeAnamnesis(json: unknown): {
  objetivo: string
  historicoEmocional: string
  medicamentos: string
  alergias: string
  expectativas: string
} {
  const o =
    json && typeof json === 'object' && !Array.isArray(json) ? (json as Record<string, unknown>) : {}
  return {
    objetivo: String(o.objetivo ?? ''),
    historicoEmocional: String(o.historicoEmocional ?? ''),
    medicamentos: String(o.medicamentos ?? ''),
    alergias: String(o.alergias ?? ''),
    expectativas: String(o.expectativas ?? ''),
  }
}

function buildProfilePayload(user: {
  name: string
  email: string
  phone: string | null
  patientProfile: { anamnese: Prisma.JsonValue } | null
}) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    anamnesis: normalizeAnamnesis(user.patientProfile?.anamnese),
  }
}

/** Fallback quando o usuário é terapeuta mas ainda não há registro em therapist_profiles. */
const EMPTY_THERAPIST_PROFILE = {
  id: null as string | null,
  bio: '',
  therapies: [] as string[],
  certifications: [] as string[],
  languages: ['Português'],
  price: '0',
  modality: 'AMBOS',
  location: null as string | null,
  city: null as string | null,
  state: null as string | null,
  country: null as string | null,
  nationality: null as string | null,
  professionalName: null as string | null,
  documentId: null as string | null,
  availability: [] as unknown[],
  targetAudience: null as unknown | null,
}

/**
 * GET /api/profile — sessão JWT/cookie (`session.sub` = userId).
 * - PACIENTE: { name, email, phone, anamnesis }
 * - TERAPEUTA / ADMIN: user serializado com JSON seguro (Decimal/Date) + fallback se não houver therapistProfile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    let user: Record<string, unknown> | null = null
    try {
      const row = await prisma.user.findUnique({
        where: { id: session.sub },
        include: {
          therapistProfile: { include: { availability: true, targetAudience: true } },
          patientProfile: { select: { anamnese: true } },
        },
      })
      if (!row) {
        user = null
      } else {
        const { password: _removed, ...rest } = row as Record<string, unknown> & { password?: string }
        user = rest as Record<string, unknown>
      }
    } catch (dbError) {
      console.error('Erro real no /profile (Prisma):', dbError)
      const msg = dbError instanceof Error ? dbError.message : 'Erro ao consultar o banco'
      return NextResponse.json({ success: false, error: msg }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (session.role === 'PACIENTE') {
      try {
        const patientProfile = (user as { patientProfile?: { anamnese: Prisma.JsonValue } | null })
          .patientProfile
        const payload = buildProfilePayload({
          name: String(user.name ?? ''),
          email: String(user.email ?? ''),
          phone: (user.phone as string | null) ?? null,
          patientProfile: patientProfile ?? null,
        })
        return NextResponse.json({ success: true, data: payload })
      } catch (e) {
        console.error('Erro real no /profile (paciente):', e)
        const msg = e instanceof Error ? e.message : 'Erro ao montar perfil'
        return NextResponse.json({ success: false, error: msg }, { status: 500 })
      }
    }

    if (session.role === 'TERAPEUTA' || session.role === 'ADMIN') {
      try {
        let data = jsonSafeSerialize(user) as Record<string, unknown>

        if (
          (session.role === 'TERAPEUTA' || session.role === 'ADMIN') &&
          (data.therapistProfile === null || data.therapistProfile === undefined)
        ) {
          data = {
            ...data,
            id: data.id ?? session.sub,
            name: data.name ?? '',
            email: data.email ?? '',
            role: data.role,
            phone: data.phone ?? null,
            avatarUrl: data.avatarUrl ?? null,
            birthDate: data.birthDate ?? null,
            therapistProfile: { ...EMPTY_THERAPIST_PROFILE },
          }
        } else if (data.therapistProfile && typeof data.therapistProfile === 'object') {
          const tp = data.therapistProfile as Record<string, unknown>
          data.therapistProfile = {
            ...tp,
            bio: tp.bio ?? '',
            therapies: Array.isArray(tp.therapies) ? tp.therapies : [],
            certifications: Array.isArray(tp.certifications) ? tp.certifications : [],
            languages: Array.isArray(tp.languages) && tp.languages.length ? tp.languages : ['Português'],
            availability: Array.isArray(tp.availability) ? tp.availability : [],
            targetAudience: tp.targetAudience ?? null,
          }
        }

        if (process.env.NODE_ENV === 'development') {
          try {
            console.log('User (profile GET):', JSON.stringify(data).slice(0, 2500))
          } catch {
            console.log('User (profile GET): [objeto grande — ver resposta 200]')
          }
        }

        return NextResponse.json({ success: true, data })
      } catch (e) {
        console.error('Erro real no /profile (terapeuta/serialização):', e)
        const msg = e instanceof Error ? e.message : 'Erro ao serializar perfil'
        return NextResponse.json({ success: false, error: msg }, { status: 500 })
      }
    }

    return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
  } catch (error) {
    console.error('Erro real no /profile:', error)
    const msg = error instanceof Error ? error.message : 'Erro ao carregar perfil'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

/** Atualiza dados pessoais, anamnese e opcionalmente senha. */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }
    if (session.role !== 'PACIENTE') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = putProfileSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { name, phone, anamnesis: anamnesisPatch, currentPassword, newPassword } = validated.data

    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return NextResponse.json(
        { success: false, error: 'Preencha senha atual e nova senha juntos' },
        { status: 400 }
      )
    }

    if (currentPassword && newPassword) {
      const u = await prisma.user.findUnique({ where: { id: session.sub } })
      if (!u || !(await bcrypt.compare(currentPassword, u.password))) {
        return NextResponse.json({ success: false, error: 'Senha atual incorreta' }, { status: 400 })
      }
    }

    const userUpdate: Prisma.UserUpdateInput = {}
    if (name !== undefined) userUpdate.name = name
    if (phone !== undefined) userUpdate.phone = phone === '' ? null : phone
    if (newPassword) userUpdate.password = await bcrypt.hash(newPassword, 12)

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: session.sub },
          data: userUpdate,
        })
      }

      if (anamnesisPatch !== undefined) {
        const existing = await tx.patientProfile.findUnique({
          where: { userId: session.sub },
          select: { anamnese: true },
        })
        const prev =
          existing?.anamnese && typeof existing.anamnese === 'object' && !Array.isArray(existing.anamnese)
            ? (existing.anamnese as Record<string, unknown>)
            : {}
        const merged = { ...prev, ...anamnesisPatch }

        await tx.patientProfile.upsert({
          where: { userId: session.sub },
          create: {
            userId: session.sub,
            anamnese: merged as Prisma.InputJsonValue,
          },
          update: {
            anamnese: merged as Prisma.InputJsonValue,
          },
        })
      }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: { patientProfile: { select: { anamnese: true } } },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: buildProfilePayload(user),
    })
  } catch (error) {
    console.error('[PUT /api/profile]', error)
    return NextResponse.json({ success: false, error: 'Erro ao salvar perfil' }, { status: 500 })
  }
}
