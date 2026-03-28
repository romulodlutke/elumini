export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

/**
 * GET /api/therapy-types — catálogo público (apenas ativos).
 * GET /api/therapy-types?all=1 — todos os registros (TERAPEUTA ou ADMIN), p.ex. sincronização de serviços.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === '1'
    const session = await getSessionFromRequest(request)
    const canSeeAll =
      session && (session.role === 'ADMIN' || session.role === 'TERAPEUTA')

    const items = await prisma.therapyType.findMany({
      where: all && canSeeAll ? {} : { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, active: true, sortOrder: true },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[GET THERAPY TYPES]', error)
    return NextResponse.json({ success: false, error: 'Erro ao listar tipos de terapia' }, { status: 500 })
  }
}
