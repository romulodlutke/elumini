/**
 * Nomes iniciais do catálogo (seed / banco vazio). O catálogo em produção vem da tabela `TherapyType`.
 * @see `/api/therapy-types`, `/dashboard/admin/therapies`
 */
export const SEED_THERAPY_TYPE_NAMES = [
  'ThetaHealing',
  'Terapias energéticas',
  'Reiki',
  'Registros Akáshicos',
  'Cura quântica',
  'Terapia emocional',
  'Terapia espiritual',
  'Constelações familiares',
  'Coaching',
  'Hipnose',
  'Biomagnetismo',
] as const

/** Opções do modal “Adicionar terapia” no painel do terapeuta (presets + Outras). */
export const THERAPIST_THERAPY_MODAL_OPTIONS = [...SEED_THERAPY_TYPE_NAMES, 'Outras'] as const

export type TherapistTherapyModalOption = (typeof THERAPIST_THERAPY_MODAL_OPTIONS)[number]

const PRESET_NAME_SET = new Set<string>(SEED_THERAPY_TYPE_NAMES)

/** Nome corresponde a um preset do catálogo (não é terapia totalmente customizada). */
export function isTherapistTherapyPresetName(name: string): boolean {
  return PRESET_NAME_SET.has(name.trim())
}
