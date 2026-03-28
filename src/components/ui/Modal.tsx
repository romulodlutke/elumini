'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  sm:  'sm:max-w-sm',
  md:  'sm:max-w-md',
  lg:  'sm:max-w-lg',
  xl:  'sm:max-w-2xl',
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    /* Mobile: itens alinhados na base (bottom sheet). Desktop sm+: centralizado */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Painel — slide de baixo no mobile, fade-in centralizado no desktop */}
      <div
        className={cn(
          'relative w-full bg-white shadow-2xl animate-slide-up',
          /* Mobile: cantos arredondados no topo, altura máxima de 92vh com scroll interno */
          'rounded-t-3xl sm:rounded-2xl',
          'max-h-[92vh] overflow-y-auto',
          /* Padding inferior para safe-area (iOS home indicator) */
          'pb-safe',
          sizeStyles[size],
          className
        )}
      >
        {/* Handle visual — só visível em mobile para indicar bottom sheet deslizável */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-sand-300" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-sand-100">
            <h2 className="text-base sm:text-lg font-semibold text-sand-900">{title}</h2>
            {/* Botão de fechar com alvo de toque mínimo de 44px */}
            <button
              onClick={onClose}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center
                         text-sand-400 hover:text-sand-700 hover:bg-sand-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
