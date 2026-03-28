'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

/**
 * Next.js route error boundary — evita tela branca e registra falhas em dev.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard error boundary]', error.message, error.digest)
  }, [error])

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-lg font-semibold text-sand-900 mb-2">Algo deu errado nesta página</h2>
      <p className="text-sm text-sand-600 mb-6 max-w-md">
        Tente novamente. Se o problema continuar, recarregue o painel ou entre em contato com o suporte.
      </p>
      <Button type="button" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  )
}
