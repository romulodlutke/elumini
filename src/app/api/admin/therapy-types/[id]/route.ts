export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { z } from 'zod'
import { slugifyTherapyName } from '@/lib/therapy-slug'

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

async function allocateUniqueSlugExcludingId(baseName: string, excludeId: string): Promise<string> {
  const base = slugifyTherapyName(baseName)
  let slug = base
  let n = 0
  for (;;) {
    const clash = await prisma.therapyType.findFirst({
      where: { slug, NOT: { id: excludeId } },
    })
    if (!clash) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const existing = await prisma.therapyType.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tipo não encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validated = patchSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      )
    }

    const { name, sortOrder, active } = validated.data
    const newName = name !== undefined ? name.trim() : undefined

    if (newName !== undefined && newName !== existing.name) {
      await prisma.$executeRaw`
        UPDATE therapist_profiles
        SET therapies = ARRAY(
          SELECT CASE WHEN x = ${existing.name} THEN ${newName} ELSE x END
          FROM unnest(therapies) AS x
        )
        WHERE ${existing.name} = ANY(therapies)
      `
      await prisma.therapistService.updateMany({
        where: { name: existing.name },
        data: { name: newName },
      })
    }

    const slug =
      newName !== undefined && newName !== existing.name
        ? await allocateUniqueSlugExcludingId(newName, params.id)
        : existing.slug

    const updated = await prisma.therapyType.update({
      where: { id: params.id },
      data: {
        ...(newName !== undefined ? { name: newName, slug } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(active !== undefined ? { active } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        active: updated.active,
        sortOrder: updated.sortOrder,
      },
    })
  } catch (error: unknown) {
    console.error('[PATCH ADMIN THERAPY TYPE]', error)
    const msg = error && typeof error === 'object' && 'code' in error && error.code === 'P2002'
      ? 'Já existe um tipo com este nome ou slug.'
      : 'Erro ao atualizar'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}

/** Desativa o tipo (exclusão lógica). Perfis e serviços mantêm o nome até edição manual. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const existing = await prisma.therapyType.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tipo não encontrado' }, { status: 404 })
    }

    await prisma.therapyType.update({
      where: { id: params.id },
      data: { active: false },
    })

    return NextResponse.json({ success: true, message: 'Tipo desativado' })
  } catch (error) {
    console.error('[DELETE ADMIN THERAPY TYPE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao desativar' }, { status: 500 })
  }
}
