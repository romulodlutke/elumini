export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { effectiveServiceCharge, listingPriceFromServices } from '@/lib/therapist-pricing'

/**
 * GET /api/therapists/[id]/public
 * Perfil público do terapeuta (para página de apresentação do paciente).
 * Só retorna se approved e user ativo.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await prisma.therapistProfile.findUnique({
      where: {
        id: params.id,
        approved: true,
        user: { active: true },
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, phone: true },
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
            problemsHelped: true,
            durationMinutes: true,
            price: true,
            promoPrice: true,
            currency: true,
            modality: true,
          },
        },
        targetAudience: {
          select: { specialNeeds: true },
        },
        certificates: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, fileUrl: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    const profilePrice = Number(profile.price)
    const servicesPayload = profile.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      problemsHelped: s.problemsHelped,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
      promoPrice: s.promoPrice ? Number(s.promoPrice) : null,
      displayPrice: effectiveServiceCharge({
        price: Number(s.price),
        promoPrice: s.promoPrice != null ? Number(s.promoPrice) : null,
      }),
      currency: s.currency,
      modality: s.modality,
    }))
    const listingPrice = listingPriceFromServices(
      profile.services.map((s) => ({
        price: Number(s.price),
        promoPrice: s.promoPrice != null ? Number(s.promoPrice) : null,
      })),
      profilePrice
    )

    const data = {
      id: profile.id,
      bio: profile.bio,
      therapies: profile.therapies,
      price: listingPrice,
      profilePrice,
      modality: profile.modality,
      location: profile.location,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      nationality: profile.nationality,
      professionalName: profile.professionalName,
      languages: profile.languages,
      whatsapp: profile.whatsapp,
      professionalEmail: profile.professionalEmail,
      instagram: profile.instagram,
      facebook: profile.facebook,
      websiteUrl: profile.websiteUrl,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      yearsExp: profile.yearsExp,
      certifications: profile.certifications,
      user: profile.user,
      availability: profile.availability,
      services: servicesPayload,
      publicTargetDescription: profile.targetAudience?.specialNeeds ?? null,
      certificates: profile.certificates,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[GET THERAPIST PUBLIC]', error)
    return NextResponse.json({ success: false, error: 'Erro ao carregar perfil' }, { status: 500 })
  }
}
