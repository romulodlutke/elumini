/** Idiomas disponíveis no perfil do terapeuta (multi-select). */
export const LANGUAGE_OPTIONS = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Italiano',
  'Alemão',
  'Mandarim',
  'Japonês',
  'Coreano',
  'Árabe',
  'Russo',
  'Holandês',
  'Libras',
  'Língua de sinais (outra)',
] as const

export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number]

const OPTION_LOWER = new Map(
  LANGUAGE_OPTIONS.map((o) => [o.toLowerCase(), o] as const)
)

/** Normaliza valores salvos no banco para os rótulos canônicos da lista. */
export function normalizeLanguagesFromServer(saved: string[] | undefined | null): string[] {
  const set = new Set<string>()
  for (const s of saved ?? []) {
    const t = String(s).trim()
    if (!t) continue
    const canonical = OPTION_LOWER.get(t.toLowerCase())
    if (canonical) set.add(canonical)
  }
  if (set.size === 0) set.add('Português')
  return Array.from(set)
}
