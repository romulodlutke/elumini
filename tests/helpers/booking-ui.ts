import type { Locator, Page } from '@playwright/test'

/** O `Modal` do app não usa `role="dialog"`; ancoramos pelo título. */
export function bookingModal(page: Page): Locator {
  return page
    .locator('div.rounded-2xl.shadow-2xl')
    .filter({ has: page.getByRole('heading', { name: 'Agendar sessão' }) })
    .first()
}

/**
 * Encontra um dia cuja disponibilidade gera slots completos (≥ minSlots e inclui 17:00).
 */
export async function pickWeekdayWithFullHourlySlots(modal: Locator, minSlots = 9): Promise<string[]> {
  let picked: string[] | null = null

  for (let week = 0; week < 10 && !picked; week++) {
    const enabledDays = modal.locator('div.grid.grid-cols-7 button:not([disabled])')
    const count = await enabledDays.count()

    for (let i = 0; i < count && !picked; i++) {
      await enabledDays.nth(i).click()
      await modal.getByRole('button', { name: 'Próximo →' }).click()

      const slotButtons = modal.locator('div.grid.grid-cols-4 button')
      const visible = await slotButtons.first().isVisible().catch(() => false)
      if (!visible) {
        await modal.getByRole('button', { name: /Voltar/i }).first().click()
        continue
      }

      const texts = await slotButtons.allTextContents()
      const times = texts.map((t) => t.trim()).filter((t) => /^\d{2}:\d{2}$/.test(t))

      if (times.length >= minSlots && times.includes('17:00')) {
        picked = times
        break
      }

      await modal.getByRole('button', { name: /Voltar/i }).first().click()
    }

    if (!picked) {
      const weekNav = modal.locator('div.flex.items-center.justify-between.mb-3')
      await weekNav.locator('button').last().click()
    }
  }

  if (!picked) {
    throw new Error(
      `Nenhum dia com ≥${minSlots} slots e 17:00 em 10 semanas — confira disponibilidade (seed/agenda).`
    )
  }

  return picked
}
