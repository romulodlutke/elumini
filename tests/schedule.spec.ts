import { test, expect } from '@playwright/test'
import { loginAsTherapist, loginAsPatient, ROUTES } from './helpers/auth'
import { attachPageMonitoring } from './helpers/monitor'
import { EXPECTED_HOURLY_SLOTS_9_TO_17 } from './helpers/slots'
import { bookingModal, pickWeekdayWithFullHourlySlots } from './helpers/booking-ui'

test.describe('Scheduling — availability & slot accuracy', () => {
  test('Define availability 09:00–17:00 on Monday and save', async ({ page }) => {
    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistAgenda)

    await page.getByRole('button', { name: 'Horários de atendimento' }).click()

    const segRow = page.locator('div.border.border-surface-200.rounded-xl').filter({ hasText: 'Segunda' }).first()
    await expect(segRow).toBeVisible()

    const addTurn = segRow.getByRole('button', { name: 'Adicionar turno' })
    if (await addTurn.isVisible()) {
      const hasSlot = (await segRow.locator('select').count()) > 0
      if (!hasSlot) {
        await addTurn.click()
      }
    }

    const selects = segRow.locator('select')
    await expect(selects.first()).toBeVisible({ timeout: 10_000 })
    await selects.nth(0).selectOption('09:00')
    await selects.nth(1).selectOption('17:00')
    await selects.nth(2).selectOption({ label: '1 hora' })

    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText(/disponibilidade salva com sucesso/i)).toBeVisible({ timeout: 15_000 })

    monitor.assertNoFetchFailed()
  })

  test('CRITICAL — public booking modal shows full hourly slots including 17:00', async ({ page }) => {
    const monitor = attachPageMonitoring(page)
    await loginAsPatient(page)
    await page.goto(ROUTES.patientSearch)

    await page.getByPlaceholder('Buscar por nome do terapeuta').fill('Ana Clara')
    await expect(page.getByText('Ana Clara').first()).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Agendar' }).first().click()

    const modal = bookingModal(page)
    await expect(modal).toBeVisible()

    const slots = await pickWeekdayWithFullHourlySlots(modal, 9)

    expect(
      slots,
      `Esperado exatamente os slots horários 09–17; recebido: ${JSON.stringify(slots)}`
    ).toEqual([...EXPECTED_HOURLY_SLOTS_9_TO_17])

    monitor.assertNoFetchFailed()
  })
})
