import { expect, type Page } from '@playwright/test'

/**
 * Captura erros de console / página e falha se aparecer "fetch failed"
 * (requisito de QA do projeto).
 */
export function attachPageMonitoring(page: Page) {
  const consoleErrors: string[] = []
  const fetchFailed: string[] = []

  const onConsole = (msg: { type: () => string; text: () => string }) => {
    const text = msg.text()
    if (msg.type() === 'error') {
      consoleErrors.push(text)
    }
    if (/fetch failed/i.test(text)) {
      fetchFailed.push(`[console] ${text}`)
    }
  }

  const onPageError = (err: Error) => {
    if (/fetch failed/i.test(err.message)) {
      fetchFailed.push(`[pageerror] ${err.message}`)
    }
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  return {
    assertNoFetchFailed() {
      expect(fetchFailed, `fetch failed detected:\n${fetchFailed.join('\n')}`).toEqual([])
    },
    /** Opcional: falhar em qualquer console.error (pode ser ruidoso com libs de terceiros). */
    assertNoConsoleErrors() {
      expect(consoleErrors, consoleErrors.join('\n')).toEqual([])
    },
  }
}
