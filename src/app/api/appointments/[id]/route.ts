export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { calculateCommission } from '@/lib/utils'

const updateSchema = z.object({
  status: z.enum(['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO']),
  cancelReason: z.string().max(500).optional(),
})

// PATCH — atualizar status do agendamento
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        therapist: { select: { userId: true } },
        patient: { select: { userId: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ success: false, error: 'Agendamento não encontrado' }, { status: 404 })
    }

    const isTherapist = appointment.therapist.userId === session.sub
    const isPatient = appointment.patient.userId === session.sub

    if (!isTherapist && !isPatient && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    if (validated.data.status === 'CANCELADO' && isPatient && !isTherapist) {
      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          status: 'CANCELADO',
          cancelReason: validated.data.cancelReason || 'Cancelado pelo paciente',
        },
      })
      return NextResponse.json({ success: true, message: 'Agendamento cancelado' })
    }

    if (validated.data.status === 'CONFIRMADO' && isTherapist && appointment.status === 'PENDENTE') {
      const price = Number(appointment.price)
      const commissionRate = Number(appointment.commissionRate)
      const { commission, therapistNet, platformRevenue } = calculateCommission(price, commissionRate)

      await prisma.appointment.update({
        where: { id: params.id },
        data: {
          status: 'CONFIRMADO',
          commission,
          therapistNet,
          platformRevenue,
        },
      })
      return NextResponse.json({ success: true, message: 'Agendamento confirmado' })
    }

    if (validated.data.status === 'CONCLUIDO' && isTherapist) {
      await prisma.appointment.update({
        where: { id: params.id },
        data: { status: 'CONCLUIDO' },
      })
      return NextResponse.json({ success: true, message: 'Agendamento concluído' })
    }

    await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: validated.data.status,
        ...(validated.data.cancelReason && { cancelReason: validated.data.cancelReason }),
      },
    })

    return NextResponse.json({ success: true, message: 'Agendamento atualizado' })
  } catch (error) {
    console.error('[PATCH APPOINTMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 })
  }
}
