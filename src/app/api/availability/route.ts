export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'

const slotSchema = z.object({
  dayOfWeek:    z.number().int().min(0).max(6),
  startTime:    z.string().regex(/^\d{2}:\d{2}$/),
  endTime:      z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.number().int().min(15).max(240).default(60),
  active:       z.boolean().default(true),
})

const saveSchema = z.object({
  slots: z.array(slotSchema),
  timezone: z.string().max(80).optional().nullable(),
})

// GET — retorna disponibilidade do terapeuta autenticado
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'TERAPEUTA') {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.sub },
      select: { id: true, timezone: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    const availability = await prisma.availability.findMany({
      where: { therapistId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: availability,
      timezone: profile.timezone ?? 'America/Sao_Paulo',
      profileId: profile.id,
    })
  } catch (error) {
    console.error('[GET AVAILABILITY]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

// POST — salva/substitui disponibilidade completa do terapeuta
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'TERAPEUTA') {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: session.sub },
      select: { id: true, timezone: true },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validated = saveSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    // Atualizar fuso horário do perfil se enviado
    if (validated.data.timezone !== undefined) {
      await prisma.therapistProfile.update({
        where: { id: profile.id },
        data: { timezone: validated.data.timezone || 'America/Sao_Paulo' },
      })
    }

    // Remove registros antigos e recria
    await prisma.availability.deleteMany({ where: { therapistId: profile.id } })

    if (validated.data.slots.length > 0) {
      await prisma.availability.createMany({
        data: validated.data.slots.map((slot) => ({
          therapistId:  profile.id,
          dayOfWeek:    slot.dayOfWeek,
          startTime:    slot.startTime,
          endTime:      slot.endTime,
          slotDuration: slot.slotDuration,
          active:       slot.active,
        })),
      })
    }

    const updated = await prisma.availability.findMany({
      where: { therapistId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    })

    const updatedProfile = await prisma.therapistProfile.findUnique({
      where: { id: profile.id },
      select: { timezone: true },
    })

    return NextResponse.json({
      success: true,
      data: updated,
      timezone: updatedProfile?.timezone ?? 'America/Sao_Paulo',
    })
  } catch (error) {
    console.error('[SAVE AVAILABILITY]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
