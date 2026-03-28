import { test, expect } from '@playwright/test'
import { loginAsTherapist, ROUTES, TEST_THERAPIST } from './helpers/auth'
import { attachPageMonitoring } from './helpers/monitor'
import { MIN_PNG_BUFFER, MIN_PDF_BUFFER } from './helpers/files'

/**
 * SUITE 1 — Perfil do terapeuta
 * Rota real: `/dashboard/terapeuta/perfil` (o enunciado citava `/profile`).
 */
test.describe.serial('Therapist profile', () => {
  test('Save profile — name + bio persist after reload', async ({ page }) => {
    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistProfile)

    const suffix = `E2E-${Date.now()}`
    const uniqueName = `${TEST_THERAPIST.displayName} ${suffix}`
    const bioSnippet = `Biografia E2E ${suffix}. ` + 'palavra '.repeat(120)

    await page.getByLabel('Nome completo').fill(uniqueName)
    await page.getByPlaceholder('Descreva sua experiência, abordagem e diferenciais...').fill(bioSnippet)

    await page.getByRole('button', { name: /Salvar alterações/i }).click()
    await expect(page.getByText(/perfil atualizado com sucesso/i)).toBeVisible({ timeout: 15_000 })

    await page.reload()
    await expect(page.getByLabel('Nome completo')).toHaveValue(uniqueName)
    await expect(page.getByPlaceholder('Descreva sua experiência, abordagem e diferenciais...')).toHaveValue(
      bioSnippet
    )

    monitor.assertNoFetchFailed()
  })

  test('Add service — appears in list', async ({ page }) => {
    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistProfile)

    const serviceName = `Serviço E2E ${Date.now()}`

    await page.getByRole('button', { name: /Adicionar serviço/i }).click()
    await expect(page.getByRole('heading', { name: /Novo serviço|Editar serviço/ })).toBeVisible()

    const servicePanel = page.getByRole('heading', { name: 'Novo serviço' }).locator('..')
    await servicePanel.getByLabel('Nome do serviço').fill(serviceName)
    await servicePanel.getByLabel('Preço', { exact: true }).fill('199.90')

    await servicePanel.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText(serviceName).first()).toBeVisible({ timeout: 15_000 })
    monitor.assertNoFetchFailed()
  })

  test('Add certification — appears as chip', async ({ page }) => {
    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistProfile)

    const cert = `Certificação E2E ${Date.now()}`

    const certBlock = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Certificações e formações' }) })
    await certBlock.getByPlaceholder(/Reiki Mestre|CRP/i).fill(cert)
    await certBlock.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText(cert, { exact: true })).toBeVisible()
    monitor.assertNoFetchFailed()
  })

  test('Upload certificate file — success', async ({ page }) => {
    test.skip(
      !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL,
      'Requer Supabase (SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL).'
    )

    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistProfile)

    const fileInput = page.locator('input[type="file"][accept*="pdf"]')
    await fileInput.setInputFiles({
      name: 'e2e-cert.pdf',
      mimeType: 'application/pdf',
      buffer: MIN_PDF_BUFFER,
    })

    await expect(page.getByText(/certificado enviado/i)).toBeVisible({ timeout: 30_000 })
    monitor.assertNoFetchFailed()
  })

  test('Upload profile image — visible after reload', async ({ page }) => {
    test.skip(
      !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL,
      'Requer Supabase para upload de avatar.'
    )

    const monitor = attachPageMonitoring(page)
    await loginAsTherapist(page)
    await page.goto(ROUTES.therapistProfile)

    await page.getByRole('button', { name: /Enviar imagem|foto profissional/i }).click()
    const avatarInput = page.getByTestId('therapist-unified-upload')
    await avatarInput.setInputFiles({
      name: 'e2e-avatar.png',
      mimeType: 'image/png',
      buffer: MIN_PNG_BUFFER,
    })

    await expect(page.getByText(/foto profissional atualizada/i)).toBeVisible({ timeout: 30_000 })

    await page.reload()
    const img = page.locator('img[alt="Foto profissional"]')
    await expect(img).toBeVisible()
    await expect(img).toHaveAttribute('src', /./)

    monitor.assertNoFetchFailed()
  })
})
