import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { AppointmentStatus } from '@prisma/client'
import { calculateCommission } from '@/lib/utils'

const createSchema = z.object({
  therapistProfileId: z.string(),
  date: z.string(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'PACIENTE') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const { therapistProfileId, date, time, notes } = validated.data

    // Buscar terapeuta
    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: therapistProfileId, approved: true },
    })

    if (!therapist) {
      return NextResponse.json({ success: false, error: 'Terapeuta não encontrado ou não aprovado' }, { status: 404 })
    }

    // Buscar perfil do paciente
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: session.sub },
    })

    if (!patientProfile) {
      return NextResponse.json({ success: false, error: 'Perfil de paciente não encontrado' }, { status: 404 })
    }

    // Combinar data e hora
    const appointmentDate = new Date(`${date}T${time}:00`)

    if (appointmentDate < new Date()) {
      return NextResponse.json({ success: false, error: 'Data deve ser no futuro' }, { status: 400 })
    }

    // Verificar conflito de horário
    const conflicting = await prisma.appointment.findFirst({
      where: {
        therapistId: therapistProfileId,
        date: appointmentDate,
        status: { in: ['PENDENTE', 'CONFIRMADO'] },
      },
    })

    if (conflicting) {
      return NextResponse.json({ success: false, error: 'Horário já ocupado. Escolha outro.' }, { status: 409 })
    }

    // Buscar taxa de comissão atual
    const config = await prisma.platformConfig.findFirst()
    const commissionRate = Number(config?.commissionRate || 10)

    const appointment = await prisma.appointment.create({
      data: {
        therapistId: therapistProfileId,
        patientId: patientProfile.id,
        date: appointmentDate,
        status: AppointmentStatus.PENDENTE,
        price: therapist.price,
        commissionRate,
        notes,
      },
    })

    // Notificar terapeuta
    await prisma.notification.create({
      data: {
        userId: therapist.userId,
        title: 'Novo agendamento!',
        message: `Você recebeu uma solicitação de agendamento para ${appointmentDate.toLocaleDateString('pt-BR')}.`,
        type: 'APPOINTMENT',
        link: `/dashboard/terapeuta/agenda`,
      },
    })

    return NextResponse.json({ success: true, data: appointment }, { status: 201 })
  } catch (error) {
    console.error('[CREATE APPOINTMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as AppointmentStatus | null
    const page = Number(searchParams.get('page') || '1')
    const perPage = Number(searchParams.get('perPage') || '10')
    const skip = (page - 1) * perPage

    let where: any = {}

    if (session.role === 'PACIENTE') {
      const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: session.sub } })
      if (!patientProfile) return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
      where.patientId = patientProfile.id
    } else if (session.role === 'TERAPEUTA') {
      const therapistProfile = await prisma.therapistProfile.findUnique({ where: { userId: session.sub } })
      if (!therapistProfile) return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
      where.therapistId = therapistProfile.id
    }

    if (status) where.status = status

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          therapist: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
          patient: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
          review: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.appointment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: { items: appointments, total, page, perPage, totalPages: Math.ceil(total / perPage) },
    })
  } catch (error) {
    console.error('[GET APPOINTMENTS]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
