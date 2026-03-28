import { test, expect } from '@playwright/test'
import {
  loginAsTherapist,
  loginAsPatient,
  logout,
  ROUTES,
  TEST_THERAPIST,
} from './helpers/auth'
import { attachPageMonitoring } from './helpers/monitor'
import { bookingModal, pickWeekdayWithFullHourlySlots } from './helpers/booking-ui'

/**
 * Fluxo completo: terapeuta garante agenda → paciente agenda sessão.
 */
test('Full booking journey — confirmation and time match', async ({ page }) => {
  test.setTimeout(120_000)
  const monitor = attachPageMonitoring(page)

  // —— Terapeuta: perfil mínimo + disponibilidade ——
  await loginAsTherapist(page)

  await page.goto(ROUTES.therapistProfile)
  const suffix = `BookingE2E-${Date.now()}`
  await page.getByLabel('Nome completo').fill(`${TEST_THERAPIST.displayName} ${suffix}`)
  await page.getByPlaceholder('Descreva sua experiência, abordagem e diferenciais...').fill(
    'Texto de biografia para teste E2E com comprimento suficiente para validação. ' + 'palavra '.repeat(110)
  )
  await page.getByRole('button', { name: /Salvar alterações/i }).click()
  await expect(page.getByText(/perfil atualizado com sucesso/i)).toBeVisible({ timeout: 15_000 })

  await page.goto(ROUTES.therapistAgenda)
  await page.getByRole('button', { name: 'Horários de atendimento' }).click()

  const segRow = page.locator('div.border.border-surface-200.rounded-xl').filter({ hasText: 'Segunda' }).first()
  const selects = segRow.locator('select')
  await expect(selects.first()).toBeVisible({ timeout: 15_000 })
  await selects.nth(0).selectOption('09:00')
  await selects.nth(1).selectOption('17:00')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText(/disponibilidade salva com sucesso/i)).toBeVisible({ timeout: 15_000 })

  await logout(page)

  // —— Paciente: busca e agendamento ——
  await loginAsPatient(page)
  await page.goto(ROUTES.patientSearch)

  await page.getByPlaceholder('Buscar por nome do terapeuta').fill('Ana Clara')
  await expect(page.getByText('Ana Clara').first()).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: 'Agendar' }).first().click()

  const modal = bookingModal(page)
  await expect(modal).toBeVisible()

  await pickWeekdayWithFullHourlySlots(modal, 9)

  const chosenTime = '11:00'
  await modal.getByRole('button', { name: chosenTime, exact: true }).click()
  await modal.getByRole('button', { name: 'Próximo →' }).click()

  await expect(modal.getByText(chosenTime).first()).toBeVisible()
  await modal.getByRole('button', { name: /Confirmar agendamento/i }).click()

  await expect(modal.getByText(/Solicitação enviada/i)).toBeVisible({ timeout: 20_000 })
  await expect(modal.getByText(chosenTime).first()).toBeVisible()

  monitor.assertNoFetchFailed()
})
