import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullPage?: boolean
  text?: string
}

export function LoadingSpinner({ size = 'md', className, fullPage, text }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 40 }

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary-50 rounded-2xl">
            <Loader2 size={40} className="animate-spin text-primary-600" />
          </div>
          {text && <p className="text-sm text-slate-600 font-medium">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 size={sizes[size]} className="animate-spin text-primary-600" />
      {text && <span className="text-sm text-slate-600">{text}</span>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-primary-50 rounded-2xl">
          <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-surface-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-200 rounded w-3/4" />
          <div className="h-3 bg-surface-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-surface-200 rounded w-full" />
        <div className="h-3 bg-surface-200 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-6 bg-surface-200 rounded-full w-20" />
        <div className="h-6 bg-surface-200 rounded-full w-16" />
      </div>
      <div className="h-10 bg-surface-200 rounded-xl mt-4" />
    </div>
  )
}
