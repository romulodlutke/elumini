export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const updateCommissionSchema = z.object({
  commissionRate: z.number().min(0).max(100),
})

export async function GET(request: NextRequest) {
  try {
    const config = await prisma.platformConfig.findFirst()
    return NextResponse.json({ success: true, data: { commissionRate: Number(config?.commissionRate || 10) } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateCommissionSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: 'Taxa inválida (0-100)' }, { status: 400 })
    }

    const existing = await prisma.platformConfig.findFirst()

    const config = existing
      ? await prisma.platformConfig.update({
          where: { id: existing.id },
          data: { commissionRate: validated.data.commissionRate, updatedBy: session.sub },
        })
      : await prisma.platformConfig.create({
          data: { commissionRate: validated.data.commissionRate, updatedBy: session.sub },
        })

    return NextResponse.json({
      success: true,
      data: { commissionRate: Number(config.commissionRate) },
      message: 'Taxa de comissão atualizada com sucesso',
    })
  } catch (error) {
    console.error('[UPDATE COMMISSION]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
