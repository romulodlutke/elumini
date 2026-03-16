/**
 * Lista única de terapias disponíveis na plataforma EALumini.
 * Usada em: busca, perfil do terapeuta, landing e seed.
 */
export const THERAPY_OPTIONS = [
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

export type TherapyOption = (typeof THERAPY_OPTIONS)[number]

/** Para a landing page: nome + emoji */
export const THERAPY_HIGHLIGHTS = THERAPY_OPTIONS.map((name, i) => {
  const emojis = ['✨', '🌿', '🧘', '📜', '🔮', '🫶', '🌸', '🌀', '💫', '🌺', '🧲']
  return { name, emoji: emojis[i] ?? '✨' }
})
