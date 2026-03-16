import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'brand'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-sand-200 text-sand-800',
  brand:   'bg-brand-100 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger:  'bg-red-50 text-red-600 border border-red-200',
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  purple:  'bg-secondary-50 text-secondary-700 border border-secondary-100',
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-pill',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px] tracking-wide' : 'px-3 py-1 text-xs tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
