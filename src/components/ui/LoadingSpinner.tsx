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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-sand-100/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white rounded-2xl shadow-card border border-sand-200">
            <Loader2 size={40} className="animate-spin text-brand-500" />
          </div>
          {text && <p className="text-sm text-sand-700 font-medium">{text}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 size={sizes[size]} className="animate-spin text-brand-500" />
      {text && <span className="text-sm text-sand-600">{text}</span>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-card border border-sand-200">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
        <p className="text-sm text-sand-500">Carregando...</p>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-sand-200 p-6">
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="skeleton w-[88px] h-[88px] rounded-full" />
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-20 rounded-pill" />
        <div className="skeleton h-6 w-16 rounded-pill" />
      </div>
      <div className="skeleton h-10 w-full rounded-pill" />
    </div>
  )
}
