'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-glow-primary active:bg-primary-800',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200',
  outline:   'border border-surface-200 bg-white text-slate-700 hover:bg-surface-50 hover:border-surface-300',
  ghost:     'bg-transparent text-slate-600 hover:bg-surface-100 hover:text-slate-900',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
}

const sizeStyles = {
  sm:  'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md:  'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg:  'px-6 py-3 text-base rounded-xl gap-2',
  xl:  'px-8 py-4 text-lg rounded-2xl gap-3',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'xl' ? 20 : 16} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
