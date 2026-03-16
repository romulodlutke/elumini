export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') as Role | null
    const page = Number(searchParams.get('page') || '1')
    const perPage = Number(searchParams.get('perPage') || '20')
    const skip = (page - 1) * perPage

    const where: any = {}
    if (role) where.role = role

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          therapistProfile: {
            select: {
              id: true, therapies: true, price: true, modality: true,
              city: true, rating: true, reviewCount: true, approved: true, yearsExp: true,
            },
          },
          patientProfile: { select: { id: true, gender: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    })
  } catch (error) {
    console.error('[ADMIN GET USERS]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
