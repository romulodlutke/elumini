'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  showValue?: boolean
  className?: string
}

const sizes = { sm: 12, md: 16, lg: 20 }

export function StarRating({
  value,
  max = 5,
  onChange,
  size = 'md',
  readOnly = true,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const starSize = sizes[size]
  const isInteractive = !readOnly && !!onChange

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = isInteractive ? star <= (hovered || value) : star <= value
        return (
          <Star
            key={star}
            size={starSize}
            className={cn(
              'transition-colors',
              filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300',
              isInteractive && 'cursor-pointer hover:scale-110'
            )}
            onClick={() => isInteractive && onChange(star)}
            onMouseEnter={() => isInteractive && setHovered(star)}
            onMouseLeave={() => isInteractive && setHovered(0)}
          />
        )
      })}
      {showValue && (
        <span className={cn('ml-1 font-medium text-slate-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
