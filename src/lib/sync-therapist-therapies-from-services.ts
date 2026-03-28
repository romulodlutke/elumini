import { prisma } from '@/lib/prisma'
import { listingPriceFromServices } from '@/lib/therapist-pricing'

/**
 * Atualiza `TherapistProfile.therapies` com os nomes únicos dos serviços ativos
 * (ordem: primeiro `createdAt`). Mantém a busca `therapy` em `/api/therapists` alinhada ao painel Terapias.
 */
export async function syncTherapistTherapiesFromActiveServices(therapistProfileId: string): Promise<string[]> {
  const rows = await prisma.therapistService.findMany({
    where: { therapistId: therapistProfileId, active: true },
    select: { name: true },
    orderBy: { createdAt: 'asc' },
  })
  const seen = new Set<string>()
  const therapies: string[] = []
  for (const r of rows) {
    const n = r.name.trim()
    const key = n.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    therapies.push(n)
  }
  await prisma.therapistProfile.update({
    where: { id: therapistProfileId },
    data: { therapies },
  })
  return therapies
}

/** Atualiza `TherapistProfile.price` com o mínimo entre serviços ativos (promoção incluída), quando houver serviços. */
export async function syncTherapistListingPriceFromActiveServices(therapistProfileId: string): Promise<void> {
  const profile = await prisma.therapistProfile.findUnique({
    where: { id: therapistProfileId },
    select: { price: true },
  })
  if (!profile) return
  const services = await prisma.therapistService.findMany({
    where: { therapistId: therapistProfileId, active: true },
    select: { price: true, promoPrice: true },
  })
  if (services.length === 0) return
  const ref = Number(profile.price)
  const minListing = listingPriceFromServices(
    services.map((s) => ({
      price: Number(s.price),
      promoPrice: s.promoPrice != null ? Number(s.promoPrice) : null,
    })),
    Number.isFinite(ref) ? ref : 0
  )
  if (Number.isFinite(minListing)) {
    await prisma.therapistProfile.update({
      where: { id: therapistProfileId },
      data: { price: minListing },
    })
  }
}
