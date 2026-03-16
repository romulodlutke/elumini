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
  primary:   'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-sm hover:shadow-brand-glow',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm',
  outline:   'border border-sand-300 bg-white text-sand-800 hover:bg-sand-100 hover:border-sand-400 active:bg-sand-200',
  ghost:     'bg-transparent text-sand-700 hover:bg-sand-200 hover:text-sand-900 active:bg-sand-300',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  sand:      'bg-sand-100 text-sand-800 border border-sand-300 hover:bg-sand-200 active:bg-sand-300',
}

const sizeStyles = {
  sm:  'px-4 py-2 text-xs font-semibold rounded-pill gap-1.5 tracking-wide',
  md:  'px-5 py-2.5 text-sm font-semibold rounded-pill gap-2',
  lg:  'px-7 py-3 text-sm font-semibold rounded-pill gap-2',
  xl:  'px-8 py-4 text-base font-semibold rounded-pill gap-2.5',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2',
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
