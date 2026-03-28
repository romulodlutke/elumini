export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Modality } from '@prisma/client'
import { listingPriceFromServices } from '@/lib/therapist-pricing'

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

    // Preço: sem serviços ativos usa profile.price; com serviços, pelo menos um serviço com price na faixa (aprox.; promo não entra no filtro SQL)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const servicePriceRange: Record<string, unknown> = { active: true }
      if (minPrice !== undefined) Object.assign(servicePriceRange, { price: { gte: minPrice } })
      if (maxPrice !== undefined) {
        const prev = servicePriceRange.price as Record<string, unknown> | undefined
        servicePriceRange.price =
          prev && typeof prev === 'object'
            ? { ...prev, lte: maxPrice }
            : { lte: maxPrice }
      }
      const noServicesPrice: Record<string, unknown> = {}
      if (minPrice !== undefined) Object.assign(noServicesPrice, { gte: minPrice })
      if (maxPrice !== undefined) Object.assign(noServicesPrice, { lte: maxPrice })
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : []),
        {
          OR: [
            {
              AND: [{ services: { none: { active: true } } }, { price: noServicesPrice }],
            },
            { services: { some: servicePriceRange } },
          ],
        },
      ]
    }
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
          availability: {
            where: { active: true },
            select: { dayOfWeek: true, startTime: true, endTime: true, slotDuration: true },
          },
          services: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              description: true,
              durationMinutes: true,
              price: true,
              promoPrice: true,
              currency: true,
              modality: true,
            },
          },
        },
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }, { reviewCount: 'desc' }],
        skip,
        take: perPage,
      }),
      prisma.therapistProfile.count({ where }),
    ])

    const items = therapists.map((t) => {
      const profilePrice = Number(t.price)
      const listingPrice = listingPriceFromServices(
        t.services.map((s) => ({
          price: Number(s.price),
          promoPrice: s.promoPrice != null ? Number(s.promoPrice) : null,
        })),
        profilePrice
      )
      return {
        ...t,
        price: listingPrice,
        profilePrice,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items,
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
