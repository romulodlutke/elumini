'use client'

import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'
import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, type, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const isPassword = type === 'password'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-sand-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-sand-900',
              'placeholder:text-sand-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500',
              'hover:border-sand-400',
              'disabled:bg-sand-100 disabled:text-sand-400 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400/25 focus:border-red-400'
                : 'border-sand-300',
              leftIcon && 'pl-11',
              (rightIcon || isPassword) && 'pr-11',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-700 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sand-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-sand-500 mt-1">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
