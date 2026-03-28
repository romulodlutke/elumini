'use client'

import { cn } from '@/lib/utils'
import { LANGUAGE_OPTIONS } from '@/constants/languages'
import { ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface LanguageMultiSelectProps {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
  className?: string
}

export function LanguageMultiSelect({
  label,
  value,
  onChange,
  disabled,
  className,
}: LanguageMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const toggle = (lang: string) => {
    if (disabled) return
    if (value.includes(lang)) {
      const next = value.filter((l) => l !== lang)
      onChange(next.length ? next : ['Português'])
    } else {
      onChange([...value, lang])
    }
  }

  const remove = (lang: string) => {
    if (disabled) return
    const next = value.filter((l) => l !== lang)
    onChange(next.length ? next : ['Português'])
  }

  return (
    <div ref={rootRef} className={cn('w-full space-y-1.5 relative', className)}>
      <span className="block text-xs font-semibold text-slate-700">{label}</span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'w-full min-h-[44px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white text-left text-sm',
          'border-slate-200 hover:border-slate-300 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {value.length === 0 ? (
            <span className="text-slate-400">Selecione…</span>
          ) : (
            value.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-0.5 max-w-full bg-slate-100 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200"
              >
                <span className="truncate">{lang}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    remove(lang)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      remove(lang)
                    }
                  }}
                  className="p-0.5 rounded hover:bg-slate-200 text-slate-500 shrink-0"
                  aria-label={`Remover ${lang}`}
                >
                  <X size={12} />
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={18}
          className={cn('text-slate-400 shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 py-1 max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg"
          role="listbox"
          aria-multiselectable
        >
          {LANGUAGE_OPTIONS.map((lang) => {
            const checked = value.includes(lang)
            return (
              <label
                key={lang}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 cursor-pointer text-sm transition-colors',
                  checked ? 'bg-green-50 text-green-900' : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-green-600 focus:ring-green-600/30"
                  checked={checked}
                  onChange={() => toggle(lang)}
                />
                <span>{lang}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
