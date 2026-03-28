export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { jsonSafeSerialize } from '@/lib/json-safe'
import bcrypt from 'bcryptjs'

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    if (session.sub !== params.id && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const row = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        therapistProfile: { include: { availability: true, targetAudience: true } },
        patientProfile: true,
      },
    })

    if (!row) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { password: _removed, ...withoutPassword } = row as Record<string, unknown> & {
      password?: string
    }
    return NextResponse.json({ success: true, data: jsonSafeSerialize(withoutPassword) })
  } catch (error) {
    console.error('[GET USER]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    if (session.sub !== params.id && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.errors[0].message }, { status: 400 })
    }

    const { name, phone, avatarUrl, birthDate, currentPassword, newPassword } = validated.data

    // Trocar senha
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: params.id } })
      if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        return NextResponse.json({ success: false, error: 'Senha atual incorreta' }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (birthDate !== undefined) updateData.birthDate = birthDate === '' || birthDate == null ? null : new Date(birthDate)
    if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12)

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, birthDate: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('[UPDATE USER]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
