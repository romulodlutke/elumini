export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { Modality } from '@prisma/client'

/** JSON.stringify(NaN) → null; omit invalid numbers. Do not map null→undefined here when field is nullable in DB. */
function preprocessOptionalNumber(v: unknown): unknown {
  if (v === undefined || v === null) return undefined
  if (typeof v === 'number' && Number.isNaN(v)) return undefined
  return v
}

/** Accept explicit null from client (clear field); strip NaN only. */
function preprocessNullableNumber(v: unknown): unknown {
  if (v === undefined) return undefined
  if (v === null) return null
  if (typeof v === 'number' && Number.isNaN(v)) return undefined
  return v
}

const updateSchema = z.object({
  // Fix: 100–300 word rule blocked every save while terapeutas edited other fields; keep length cap only.
  bio: z.string().max(2500).optional().nullable(),
  price: z.preprocess(preprocessOptionalNumber, z.number().min(0).optional()),
  modality: z.nativeEnum(Modality).optional(),
  location: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(2).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  professionalName: z.string().max(150).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  documentId: z.string().max(100).optional().nullable(),
  languages: z.array(z.string()).optional(),
  yearsExp: z.preprocess(preprocessNullableNumber, z.number().int().min(0).optional().nullable()),
  therapies: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  sessionsPerMonthGoal: z.preprocess(preprocessNullableNumber, z.number().int().min(0).optional().nullable()),
  publicTargetDescription: z.string().max(2000).optional().nullable(),
  // Dados de contato
  whatsapp: z.string().max(30).optional().nullable(),
  professionalEmail: z.string().email().optional().nullable().or(z.literal('')),
  instagram: z.string().max(150).optional().nullable(),
  facebook: z.string().max(250).optional().nullable(),
  websiteUrl: z.string().url().optional().nullable().or(z.literal('')),
  timezone: z.string().max(80).optional().nullable(),
  wantCampaigns: z.boolean().optional(),
  allowAutoScheduling: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      include: { targetAudience: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    if (process.env.NODE_ENV === 'development') {
      console.log('[PATCH THERAPIST PROFILE] id=%s keys=%s', params.id, Object.keys(body || {}).join(','))
    }
    const validated = updateSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { publicTargetDescription, ...profileData } = validated.data

    const updatePayload: Record<string, unknown> = {}
    if (profileData.bio !== undefined) updatePayload.bio = profileData.bio
    if (profileData.price !== undefined) updatePayload.price = profileData.price
    if (profileData.modality !== undefined) updatePayload.modality = profileData.modality
    if (profileData.location !== undefined) updatePayload.location = profileData.location
    if (profileData.city !== undefined) updatePayload.city = profileData.city
    if (profileData.state !== undefined) updatePayload.state = profileData.state
    if (profileData.country !== undefined) updatePayload.country = profileData.country
    if (profileData.professionalName !== undefined) updatePayload.professionalName = profileData.professionalName
    if (profileData.nationality !== undefined) updatePayload.nationality = profileData.nationality
    if (profileData.documentId !== undefined) updatePayload.documentId = profileData.documentId
    if (profileData.languages !== undefined) updatePayload.languages = profileData.languages
    if (profileData.yearsExp !== undefined) updatePayload.yearsExp = profileData.yearsExp
    if (profileData.therapies !== undefined) updatePayload.therapies = profileData.therapies
    if (profileData.certifications !== undefined) updatePayload.certifications = profileData.certifications
    if (profileData.sessionsPerMonthGoal !== undefined) updatePayload.sessionsPerMonthGoal = profileData.sessionsPerMonthGoal
    if (profileData.whatsapp !== undefined) updatePayload.whatsapp = profileData.whatsapp || null
    if (profileData.professionalEmail !== undefined) updatePayload.professionalEmail = profileData.professionalEmail === '' ? null : profileData.professionalEmail
    if (profileData.instagram !== undefined) updatePayload.instagram = profileData.instagram || null
    if (profileData.facebook !== undefined) updatePayload.facebook = profileData.facebook || null
    if (profileData.websiteUrl !== undefined) updatePayload.websiteUrl = profileData.websiteUrl === '' ? null : profileData.websiteUrl
    if (profileData.timezone !== undefined) updatePayload.timezone = profileData.timezone || null
    if (profileData.wantCampaigns !== undefined) updatePayload.wantCampaigns = profileData.wantCampaigns
    if (profileData.allowAutoScheduling !== undefined) updatePayload.allowAutoScheduling = profileData.allowAutoScheduling

    await prisma.$transaction([
      prisma.therapistProfile.update({
        where: { id: params.id },
        data: updatePayload,
      }),
      ...(publicTargetDescription !== undefined
        ? [
            prisma.therapistTargetAudience.upsert({
              where: { therapistId: params.id },
              create: { therapistId: params.id, specialNeeds: publicTargetDescription || null },
              update: { specialNeeds: publicTargetDescription || null },
            }),
          ]
        : []),
    ])

    return NextResponse.json({ success: true, message: 'Perfil atualizado' })
  } catch (error) {
    console.error('[PATCH THERAPIST PROFILE]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
