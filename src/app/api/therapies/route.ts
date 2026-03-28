export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { requireTherapistProfileForApi } from '@/lib/api-therapist-self'
import { z } from 'zod'
import { Modality } from '@prisma/client'
import {
  syncTherapistListingPriceFromActiveServices,
  syncTherapistTherapiesFromActiveServices,
} from '@/lib/sync-therapist-therapies-from-services'

/**
 * Terapias do terapeuta logado.
 * Persistência: `TherapistService` (mesma entidade usada em agenda e booking).
 */
const createTherapySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  price: z.number().min(0, 'Valor inválido'),
  durationMinutes: z
    .number()
    .int()
    .min(15, 'Duração mínima: 15 min')
    .max(480, 'Duração máxima: 480 min'),
  modality: z.nativeEnum(Modality).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    const gate = await requireTherapistProfileForApi(session)
    if (!gate.ok) return gate.response

    const rows = await prisma.therapistService.findMany({
      where: { therapistId: gate.profileId },
      orderBy: { createdAt: 'desc' },
    })

    const data = rows.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      durationMinutes: s.durationMinutes,
      currency: s.currency,
      modality: s.modality,
      active: s.active,
      createdAt: s.createdAt.toISOString(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (e) {
    console.error('[GET /api/therapies]', e)
    return NextResponse.json({ success: false, error: 'Erro ao listar terapias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    const gate = await requireTherapistProfileForApi(session)
    if (!gate.ok) return gate.response

    const body = await request.json()
    const validated = createTherapySchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { name, price, durationMinutes, modality } = validated.data
    const trimmed = name.trim()

    const duplicate = await prisma.therapistService.findFirst({
      where: {
        therapistId: gate.profileId,
        name: { equals: trimmed, mode: 'insensitive' },
      },
    })
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma terapia com este nome. Edite a existente ou escolha outro nome.' },
        { status: 409 }
      )
    }

    const service = await prisma.therapistService.create({
      data: {
        therapistId: gate.profileId,
        name: trimmed,
        description: null,
        problemsHelped: null,
        durationMinutes,
        price,
        promoPrice: null,
        currency: 'BRL',
        modality: modality ?? Modality.AMBOS,
      },
    })

    await syncTherapistTherapiesFromActiveServices(gate.profileId)
    await syncTherapistListingPriceFromActiveServices(gate.profileId)

    return NextResponse.json({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        price: Number(service.price),
        durationMinutes: service.durationMinutes,
        currency: service.currency,
        modality: service.modality,
        active: service.active,
        createdAt: service.createdAt.toISOString(),
      },
    })
  } catch (e) {
    console.error('[POST /api/therapies]', e)
    return NextResponse.json({ success: false, error: 'Erro ao salvar terapia' }, { status: 500 })
  }
}
