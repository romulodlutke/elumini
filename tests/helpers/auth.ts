import type { Page } from '@playwright/test'

/** Contas alinhadas ao `prisma/seed.ts` */
export const TEST_THERAPIST = {
  email: 'ana.ribeiro@ealumini.com',
  password: 'Terapeuta@123',
  displayName: 'Ana Clara',
} as const

export const TEST_PATIENT = {
  email: 'marcos.pereira@email.com',
  password: 'Paciente@123',
} as const

/** Rota real do app (o enunciado citava /profile). */
export const ROUTES = {
  therapistProfile: '/dashboard/terapeuta/perfil',
  therapistAgenda: '/dashboard/terapeuta/agenda',
  patientSearch: '/dashboard/paciente/buscar',
  login: '/login',
} as const

export async function loginAsTherapist(page: Page) {
  await page.goto(ROUTES.login)
  await page.getByLabel('E-mail').fill(TEST_THERAPIST.email)
  await page.getByLabel('Senha').fill(TEST_THERAPIST.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/dashboard\/terapeuta(\/|$)/)
}

export async function loginAsPatient(page: Page) {
  await page.goto(ROUTES.login)
  await page.getByLabel('E-mail').fill(TEST_PATIENT.email)
  await page.getByLabel('Senha').fill(TEST_PATIENT.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/dashboard\/paciente(\/|$)/)
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Sair' }).click()
  await page.waitForURL(/\/login/)
}
