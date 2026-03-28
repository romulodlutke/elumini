'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sand'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles = {
  primary:   'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md',
  secondary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-sm',
  outline:   'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  sand:      'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 active:bg-slate-300',
}

/* min-h-[44px] garante alvo de toque mínimo (WCAG 2.5.5 / Apple HIG) */
const sizeStyles = {
  sm:  'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5 min-h-[44px]',
  md:  'px-4 py-2 text-sm font-semibold rounded-lg gap-2 min-h-[44px]',
  lg:  'px-6 py-2.5 text-sm font-semibold rounded-lg gap-2 min-h-[44px]',
  xl:  'px-8 py-3 text-base font-semibold rounded-lg gap-2.5 min-h-[44px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    fullWidth,
    children,
    disabled,
    type = 'button',
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/30 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin flex-shrink-0" size={size === 'sm' ? 13 : size === 'xl' ? 18 : 15} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
