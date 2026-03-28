/**
 * Converte valores Prisma (Decimal, Date, BigInt) e objetos aninhados em algo que
 * `JSON.stringify` / `NextResponse.json` aceita sem lançar erro.
 */
export function jsonSafeSerialize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || value === undefined) return value
  if (typeof value === 'bigint') return value.toString()
  if (typeof value !== 'object') return value

  if (seen.has(value as object)) return null
  seen.add(value as object)

  if (value instanceof Date) {
    seen.delete(value as object)
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    const arr = value.map((item) => jsonSafeSerialize(item, seen))
    seen.delete(value as object)
    return arr
  }

  // Prisma Decimal (decimal.js): tem toFixed + toString
  const maybeDec = value as { toFixed?: (n?: number) => string; toString?: () => string }
  if (typeof maybeDec.toFixed === 'function' && typeof maybeDec.toString === 'function') {
    seen.delete(value as object)
    return maybeDec.toString()
  }

  const o = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(o)) {
    if (key === 'password') continue
    out[key] = jsonSafeSerialize(o[key], seen)
  }
  seen.delete(value as object)
  return out
}
