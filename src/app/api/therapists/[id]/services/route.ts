export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { Modality } from '@prisma/client'

const createServiceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  description: z.string().max(2000).optional().nullable(),
  problemsHelped: z.string().max(1000).optional().nullable(),
  durationMinutes: z.number().int().min(15).max(480),
  price: z.number().min(0),
  promoPrice: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).default('BRL'),
  modality: z.nativeEnum(Modality).default('AMBOS'),
})

// GET — listar serviços do terapeuta
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    const isOwnerOrAdmin =
      (session?.sub === profile.userId && session?.role === 'TERAPEUTA') || session?.role === 'ADMIN'

    const services = await prisma.therapistService.findMany({
      where: {
        therapistId: params.id,
        ...(isOwnerOrAdmin ? {} : { active: true }),
      },
      orderBy: { createdAt: 'asc' },
    })

    const data = services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      problemsHelped: s.problemsHelped,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
      promoPrice: s.promoPrice ? Number(s.promoPrice) : null,
      currency: s.currency,
      modality: s.modality,
      active: s.active,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET THERAPIST SERVICES]', error)
    return NextResponse.json({ success: false, error: 'Erro ao listar serviços' }, { status: 500 })
  }
}

// POST — criar serviço (apenas o próprio terapeuta ou admin)
export async function POST(
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
      select: {
        id: true,
        userId: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createServiceSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { price, promoPrice, ...rest } = validated.data

    const finalPromoPrice: number | null =
      promoPrice != null && promoPrice > 0 ? promoPrice : null

    const service = await prisma.therapistService.create({
      data: {
        therapistId: params.id,
        name: rest.name,
        description: rest.description ?? null,
        problemsHelped: rest.problemsHelped ?? null,
        durationMinutes: rest.durationMinutes,
        price,
        promoPrice: finalPromoPrice,
        currency: rest.currency,
        modality: rest.modality,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        description: service.description,
        problemsHelped: service.problemsHelped,
        durationMinutes: service.durationMinutes,
        price: Number(service.price),
        promoPrice: service.promoPrice ? Number(service.promoPrice) : null,
        currency: service.currency,
        modality: service.modality,
        active: service.active,
      },
    })
  } catch (error) {
    console.error('[POST THERAPIST SERVICE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar serviço' }, { status: 500 })
  }
}
