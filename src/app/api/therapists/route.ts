import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Modality } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = Number(searchParams.get('page') || '1')
    const perPage = Number(searchParams.get('perPage') || '12')
    const search = searchParams.get('search') || ''
    const therapy = searchParams.get('therapy') || ''
    const modality = searchParams.get('modality') as Modality | null
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined
    const city = searchParams.get('city') || ''
    const state = searchParams.get('state') || ''

    const skip = (page - 1) * perPage

    const where: any = {
      approved: true,
      user: { active: true },
    }

    if (search) {
      where.user = {
        ...where.user,
        name: { contains: search, mode: 'insensitive' },
      }
    }

    if (therapy) {
      where.therapies = { has: therapy }
    }

    if (modality && modality !== 'AMBOS') {
      where.OR = [{ modality }, { modality: 'AMBOS' }]
    }

    if (minPrice !== undefined) where.price = { ...where.price, gte: minPrice }
    if (maxPrice !== undefined) where.price = { ...where.price, lte: maxPrice }
    if (minRating !== undefined) where.rating = { gte: minRating }
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (state) where.state = state

    const [therapists, total] = await Promise.all([
      prisma.therapistProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }],
        skip,
        take: perPage,
      }),
      prisma.therapistProfile.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: therapists,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    })
  } catch (error) {
    console.error('[GET THERAPISTS]', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar terapeutas' }, { status: 500 })
  }
}
