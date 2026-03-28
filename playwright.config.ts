import { defineConfig, devices } from '@playwright/test'

/**
 * E2E — EALumini / holosconnect
 *
 * Run (server on :3000):
 *   npx playwright test
 *
 * Headed + debug (as requested for troubleshooting):
 *   PLAYWRIGHT_HEADED=1 npx playwright test --headed
 *
 * Pré-requisitos: `.env` com JWT_SECRET, DB, e `npm run db:seed` para contas de teste.
 * Uploads (avatar/certificado) exigem Supabase configurado ou os testes de upload são pulados.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Alinha dia da semana / horários com o fuso usado pelos terapeutas no seed. */
    timezoneId: 'America/Sao_Paulo',
    headless: process.env.PLAYWRIGHT_HEADED !== '1',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
