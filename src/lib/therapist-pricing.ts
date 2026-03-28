/** Preço efetivo cobrado por serviço (promoção ativa quando definida e > 0). */
export type ServicePriceLike = {
  price: number | string
  promoPrice?: number | string | null
}

export function effectiveServiceCharge(s: ServicePriceLike): number {
  const base = Number(s.price)
  const promoRaw = s.promoPrice
  const promo =
    promoRaw != null && promoRaw !== '' && !Number.isNaN(Number(promoRaw)) ? Number(promoRaw) : NaN
  if (Number.isFinite(promo) && promo > 0) return promo
  return Number.isFinite(base) ? base : 0
}

/** Preço de listagem “a partir de”: mínimo entre serviços ativos; senão perfil. */
export function listingPriceFromServices(
  services: ServicePriceLike[],
  profilePrice: number
): number {
  if (!services.length) return profilePrice
  return Math.min(...services.map(effectiveServiceCharge))
}
