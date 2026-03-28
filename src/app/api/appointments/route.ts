export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { calculateCommission } from '@/lib/utils'
import { effectiveServiceCharge } from '@/lib/therapist-pricing'
import { sendWhatsAppMessage } from '@/services/whatsappService'

const createSchema = z.object({
  therapistProfileId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(1000).optional(),
  serviceId: z.string().optional(),
})

// GET — listar agendamentos (por role: terapeuta ou paciente)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const perPage = Math.min(Number(searchParams.get('perPage') || '20'), 50)
    const page = Number(searchParams.get('page') || '1')

    const where: Record<string, unknown> = {}
    if (status && ['PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO'].includes(status)) {
      where.status = status
    }

    if (session.role === 'TERAPEUTA') {
      const profile = await prisma.therapistProfile.findUnique({
        where: { userId: session.sub },
        select: { id: true },
      })
      if (!profile) {
        return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
      }
      where.therapistId = profile.id
    } else if (session.role === 'PACIENTE') {
      const profile = await prisma.patientProfile.findUnique({
        where: { userId: session.sub },
        select: { id: true },
      })
      if (!profile) {
        return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
      }
      where.patientId = profile.id
    } else {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          therapist: {
            select: {
              id: true,
              therapies: true,
              user: { select: { name: true, avatarUrl: true } },
            },
          },
          patient: {
            select: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
          service: {
            select: { id: true, name: true, durationMinutes: true },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ])

    const data = items.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      status: a.status,
      price: Number(a.price),
      therapistNet: a.therapistNet ? Number(a.therapistNet) : null,
      notes: a.notes,
      cancelReason: a.cancelReason,
      durationMinutes: a.durationMinutes,
      therapist: a.therapist,
      patient: a.patient,
      service: a.service,
    }))

    return NextResponse.json({
      success: true,
      data: { items: data, total, page, perPage, totalPages: Math.ceil(total / perPage) },
    })
  } catch (error) {
    console.error('[GET APPOINTMENTS]', error)
    return NextResponse.json({ success: false, error: 'Erro ao listar agendamentos' }, { status: 500 })
  }
}

// POST — criar agendamento (paciente)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'PACIENTE') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.sub },
      select: { id: true, user: { select: { name: true } } },
    })
    if (!patientProfile) {
      return NextResponse.json({ success: false, error: 'Perfil de paciente não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { therapistProfileId, date, time, notes, serviceId } = validated.data

    const therapist = await prisma.therapistProfile.findFirst({
      where: { id: therapistProfileId, approved: true, user: { active: true } },
      include: {
        availability: { where: { active: true } },
        services: { where: { active: true }, select: { id: true, price: true, promoPrice: true, durationMinutes: true, active: true } },
      },
    })

    if (!therapist) {
      return NextResponse.json({ success: false, error: 'Terapeuta não encontrado ou não aprovado' }, { status: 404 })
    }

    const activeServices = therapist.services.filter((s) => s.active)
    if (activeServices.length > 0 && !serviceId) {
      return NextResponse.json(
        { success: false, error: 'Selecione o tipo de sessão (serviço) para agendar com este terapeuta.' },
        { status: 400 }
      )
    }

    let price: number
    let durationMinutes: number
    let finalServiceId: string | null = null

    const svc = serviceId ? activeServices.find((s) => s.id === serviceId) : null
    if (activeServices.length > 0) {
      if (!svc) {
        return NextResponse.json(
          { success: false, error: 'Serviço inválido ou não disponível para este terapeuta.' },
          { status: 400 }
        )
      }
      price = effectiveServiceCharge({
        price: Number(svc.price),
        promoPrice: svc.promoPrice != null ? Number(svc.promoPrice) : null,
      })
      durationMinutes = svc.durationMinutes
      finalServiceId = svc.id
    } else {
      price = Number(therapist.price)
      durationMinutes = 60
    }

    const dateObj = new Date(`${date}T${time}:00`)
    const dayOfWeek = dateObj.getDay()
    const timeStr = time

    // Alinhar com generateTimeSlots: endTime é inclusivo para o *início* do slot (ex.: 09:00–17:00 permite 17:00).
    const hasAvailability = therapist.availability.some(
      (a) => a.dayOfWeek === dayOfWeek && timeStr >= a.startTime && timeStr <= a.endTime
    )
    if (!hasAvailability) {
      return NextResponse.json({ success: false, error: 'Horário não disponível' }, { status: 400 })
    }

    const config = await prisma.platformConfig.findFirst({ orderBy: { updatedAt: 'desc' } })
    const commissionRate = Number(config?.commissionRate ?? 10)

    const { commission, therapistNet, platformRevenue } = calculateCommission(price, commissionRate)

    const appointment = await prisma.appointment.create({
      data: {
        therapistId: therapist.id,
        patientId: patientProfile.id,
        serviceId: finalServiceId,
        date: dateObj,
        durationMinutes,
        price,
        commissionRate,
        commission,
        therapistNet,
        platformRevenue,
        notes: notes || null,
      },
    })

    const patientName = patientProfile.user?.name ?? 'Paciente'
    const datetime = appointment.date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'short',
    })
    void sendWhatsAppMessage(
      `Novo agendamento:\nPaciente: ${patientName}\nData: ${datetime}`
    )

    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        date: appointment.date.toISOString(),
        status: appointment.status,
        price: Number(appointment.price),
      },
    })
  } catch (error) {
    console.error('[POST APPOINTMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}
