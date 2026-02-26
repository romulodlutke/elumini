import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, phone: true, createdAt: true },
        },
        availability: {
          where: { active: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          include: {
            author: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!therapist) {
      return NextResponse.json({ success: false, error: 'Terapeuta não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: therapist })
  } catch (error) {
    console.error('[GET THERAPIST]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

const updateSchema = z.object({
  bio: z.string().optional(),
  therapies: z.array(z.string()).optional(),
  price: z.number().positive().optional(),
  modality: z.enum(['ONLINE', 'PRESENCIAL', 'AMBOS']).optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  yearsExp: z.number().optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const therapist = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })

    if (!therapist) {
      return NextResponse.json({ success: false, error: 'Terapeuta não encontrado' }, { status: 404 })
    }

    // Apenas o próprio terapeuta ou admin pode atualizar
    if (session.sub !== therapist.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const updated = await prisma.therapistProfile.update({
      where: { id: params.id },
      data: { ...validated.data, modality: validated.data.modality as any },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[UPDATE THERAPIST]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
