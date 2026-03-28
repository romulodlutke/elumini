export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { Modality } from '@prisma/client'

const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional().nullable(),
  problemsHelped: z.string().max(1000).optional().nullable(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  price: z.number().min(0).optional(),
  promoPrice: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  modality: z.nativeEnum(Modality).optional(),
  active: z.boolean().optional(),
})

// PATCH — atualizar serviço
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const service = await prisma.therapistService.findFirst({
      where: { id: params.serviceId, therapistId: params.id },
      include: {
        therapist: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 })
    }

    if (service.therapist.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateServiceSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const updateData = { ...validated.data }

    const updated = await prisma.therapistService.update({
      where: { id: params.serviceId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        problemsHelped: updated.problemsHelped,
        durationMinutes: updated.durationMinutes,
        price: Number(updated.price),
        promoPrice: updated.promoPrice ? Number(updated.promoPrice) : null,
        currency: updated.currency,
        modality: updated.modality,
        active: updated.active,
      },
    })
  } catch (error) {
    console.error('[PATCH THERAPIST SERVICE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar serviço' }, { status: 500 })
  }
}

// DELETE — remover serviço
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; serviceId: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const service = await prisma.therapistService.findFirst({
      where: { id: params.serviceId, therapistId: params.id },
      include: { therapist: { select: { userId: true } } },
    })

    if (!service) {
      return NextResponse.json({ success: false, error: 'Serviço não encontrado' }, { status: 404 })
    }

    if (service.therapist.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    await prisma.therapistService.delete({
      where: { id: params.serviceId },
    })

    return NextResponse.json({ success: true, message: 'Serviço removido' })
  } catch (error) {
    console.error('[DELETE THERAPIST SERVICE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao remover serviço' }, { status: 500 })
  }
}
