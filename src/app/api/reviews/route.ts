export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const createReviewSchema = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'PACIENTE') {
      return NextResponse.json({ success: false, error: 'Apenas pacientes podem avaliar' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createReviewSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const { appointmentId, rating, comment } = validated.data

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { select: { userId: true } },
        review: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ success: false, error: 'Agendamento não encontrado' }, { status: 404 })
    }

    if (appointment.patient.userId !== session.sub) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    if (appointment.status !== 'CONCLUIDO') {
      return NextResponse.json({ success: false, error: 'Somente sessões concluídas podem ser avaliadas' }, { status: 400 })
    }

    if (appointment.review) {
      return NextResponse.json({ success: false, error: 'Esta sessão já foi avaliada' }, { status: 409 })
    }

    const review = await prisma.review.create({
      data: {
        appointmentId,
        therapistId: appointment.therapistId,
        authorId: session.sub,
        rating,
        comment,
      },
    })

    // Recalcular rating médio do terapeuta
    const reviews = await prisma.review.findMany({
      where: { therapistId: appointment.therapistId },
      select: { rating: true },
    })

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

    await prisma.therapistProfile.update({
      where: { id: appointment.therapistId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error('[CREATE REVIEW]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
