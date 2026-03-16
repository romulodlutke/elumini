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
    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    const services = await prisma.therapistService.findMany({
      where: { therapistId: params.id, active: true },
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
        minSessionPrice: true,
        maxSessionPrice: true,
        allowPromos: true,
        minPromoPrice: true,
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

    // Validação: preço dentro da faixa oficial (min/max sessão base)
    const minPrice = profile.minSessionPrice != null ? Number(profile.minSessionPrice) : null
    const maxPrice = profile.maxSessionPrice != null ? Number(profile.maxSessionPrice) : null
    if (minPrice != null && price < minPrice) {
      return NextResponse.json(
        { success: false, error: `O preço do serviço não pode ser menor que o preço mínimo da sessão (${minPrice})` },
        { status: 400 }
      )
    }
    if (maxPrice != null && price > maxPrice) {
      return NextResponse.json(
        { success: false, error: `O preço do serviço não pode ser maior que o preço máximo da sessão (${maxPrice})` },
        { status: 400 }
      )
    }

    // Validação: promoção só se autorizada; preço promocional >= mínimo permitido
    let finalPromoPrice: number | null = null
    if (promoPrice != null && promoPrice > 0) {
      if (!profile.allowPromos) {
        return NextResponse.json(
          { success: false, error: 'Você não autorizou promoções no preço da sessão base. Ative em "Preço oficial da sessão base".' },
          { status: 400 }
        )
      }
      const minPromo = profile.minPromoPrice != null ? Number(profile.minPromoPrice) : null
      if (minPromo != null && promoPrice < minPromo) {
        return NextResponse.json(
          { success: false, error: `O preço promocional não pode ser menor que o mínimo permitido (${minPromo})` },
          { status: 400 }
        )
      }
      finalPromoPrice = promoPrice
    }

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
      },
    })
  } catch (error) {
    console.error('[POST THERAPIST SERVICE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar serviço' }, { status: 500 })
  }
}
