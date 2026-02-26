import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { AppointmentStatus } from '@prisma/client'
import { calculateCommission } from '@/lib/utils'

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMADO', 'CONCLUIDO', 'CANCELADO']),
  cancelReason: z.string().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
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

    const body = await request.json()
    const validated = updateStatusSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const { status, cancelReason } = validated.data

    // Verificar permissão por role
    const isTherapist = session.sub === appointment.therapist.userId
    const isPatient = session.sub === appointment.patient.userId
    const isAdmin = session.role === 'ADMIN'

    if (!isTherapist && !isPatient && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    // Regras de negócio para mudança de status
    if (status === 'CONFIRMADO' && !isTherapist && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Somente o terapeuta pode confirmar' }, { status: 403 })
    }

    if (status === 'CONCLUIDO' && !isTherapist && !isAdmin) {
      return NextResponse.json({ success: false, error: 'Somente o terapeuta pode concluir' }, { status: 403 })
    }

    // Calcular comissão ao confirmar
    let updateData: any = { status, cancelReason }

    if (status === 'CONFIRMADO') {
      const { commission, therapistNet, platformRevenue } = calculateCommission(
        Number(appointment.price),
        Number(appointment.commissionRate)
      )
      updateData = { ...updateData, commission, therapistNet, platformRevenue }
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
    })

    // Notificar paciente sobre mudança de status
    const statusMessages: Record<string, string> = {
      CONFIRMADO: 'Seu agendamento foi confirmado pelo terapeuta!',
      CONCLUIDO: 'Sua sessão foi concluída. Que tal deixar uma avaliação?',
      CANCELADO: `Seu agendamento foi cancelado. ${cancelReason ? `Motivo: ${cancelReason}` : ''}`,
    }

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: appointment.patient.userId,
          title: `Agendamento ${status === 'CONFIRMADO' ? 'confirmado' : status === 'CONCLUIDO' ? 'concluído' : 'cancelado'}`,
          message: statusMessages[status],
          type: status === 'CANCELADO' ? 'WARNING' : 'SUCCESS',
          link: '/dashboard/paciente/agendamentos',
        },
      })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[UPDATE APPOINTMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
