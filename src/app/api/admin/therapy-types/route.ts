export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { slugifyTherapyName } from '@/lib/therapy-slug'

const createSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

async function allocateUniqueSlug(baseName: string): Promise<string> {
  const base = slugifyTherapyName(baseName)
  let slug = base
  let n = 0
  while (await prisma.therapyType.findUnique({ where: { slug } })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const items = await prisma.therapyType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, active: true, sortOrder: true, createdAt: true },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[GET ADMIN THERAPY TYPES]', error)
    return NextResponse.json({ success: false, error: 'Erro ao listar' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { name, sortOrder, active } = validated.data
    const trimmed = name.trim()
    const slug = await allocateUniqueSlug(trimmed)

    const row = await prisma.therapyType.create({
      data: {
        name: trimmed,
        slug,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        active: row.active,
        sortOrder: row.sortOrder,
      },
    })
  } catch (error: unknown) {
    console.error('[POST ADMIN THERAPY TYPES]', error)
    const msg = error && typeof error === 'object' && 'code' in error && error.code === 'P2002'
      ? 'Já existe um tipo com este nome ou slug.'
      : 'Erro ao criar tipo de terapia'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
