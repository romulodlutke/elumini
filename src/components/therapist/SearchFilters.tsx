'use client'

import { cn } from '@/lib/utils'
import { THERAPY_OPTIONS } from '@/constants/therapies'
import { SlidersHorizontal, X, ChevronDown, Star } from 'lucide-react'
import { useState } from 'react'

const RATING_OPTIONS = [
  { label: '4.5+', value: 4.5 },
  { label: '4.0+', value: 4.0 },
  { label: '3.5+', value: 3.5 },
]

export interface SearchFiltersValues {
  therapies: string[]
  modality: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  city?: string
}

interface SearchFiltersProps {
  values: SearchFiltersValues
  onChange: (values: SearchFiltersValues) => void
  onReset: () => void
  className?: string
}

export function SearchFilters({ values, onChange, onReset, className }: SearchFiltersProps) {
  const [openSection, setOpenSection] = useState<string | null>('therapies')

  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section)

  const toggleTherapy = (therapy: string) => {
    const updated = values.therapies.includes(therapy)
      ? values.therapies.filter((t) => t !== therapy)
      : [...values.therapies, therapy]
    onChange({ ...values, therapies: updated })
  }

  const activeCount = [
    values.therapies.length > 0,
    values.modality !== '',
    values.minPrice !== undefined || values.maxPrice !== undefined,
    values.minRating !== undefined,
    !!values.city,
  ].filter(Boolean).length

  return (
    <aside className={cn('bg-white rounded-2xl border border-sand-200 shadow-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-brand-500" />
          <span className="font-semibold text-sand-900 text-sm uppercase tracking-wider">Filtros</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-sand-400 hover:text-red-500 flex items-center gap-1 transition-colors font-medium"
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      {/* Tipo de terapia */}
      <FilterSection
        title="Tipo de terapia"
        isOpen={openSection === 'therapies'}
        onToggle={() => toggleSection('therapies')}
        count={values.therapies.length > 0 ? values.therapies.length : undefined}
      >
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {THERAPY_OPTIONS.map((therapy) => {
            const checked = values.therapies.includes(therapy)
            return (
              <label key={therapy} className="flex items-center gap-3 cursor-pointer group py-0.5">
                <div className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  checked ? 'bg-brand-500 border-brand-500' : 'border-sand-300 group-hover:border-brand-400'
                )}>
                  {checked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleTherapy(therapy)} />
                <span className="text-sm text-sand-700 group-hover:text-sand-900 transition-colors select-none">
                  {therapy}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Modalidade */}
      <FilterSection
        title="Modalidade"
        isOpen={openSection === 'modality'}
        onToggle={() => toggleSection('modality')}
      >
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Todas', value: '' },
            { label: 'Online', value: 'ONLINE' },
            { label: 'Presencial', value: 'PRESENCIAL' },
          ].map((opt) => {
            const selected = values.modality === opt.value
            return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group py-0.5">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  selected ? 'border-brand-500' : 'border-sand-300 group-hover:border-brand-400'
                )}>
                  {selected && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
                <input
                  type="radio"
                  className="sr-only"
                  name="modality"
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange({ ...values, modality: opt.value })}
                />
                <span className="text-sm text-sand-700 group-hover:text-sand-900 select-none">{opt.label}</span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Faixa de preço */}
      <FilterSection
        title="Faixa de preço"
        isOpen={openSection === 'price'}
        onToggle={() => toggleSection('price')}
      >
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-sand-400 font-semibold uppercase tracking-wider mb-1.5">Mínimo</p>
            <input
              type="number"
              placeholder="R$ 0"
              value={values.minPrice || ''}
              onChange={(e) => onChange({ ...values, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm border border-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-sand-50"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-sand-400 font-semibold uppercase tracking-wider mb-1.5">Máximo</p>
            <input
              type="number"
              placeholder="R$ 500"
              value={values.maxPrice || ''}
              onChange={(e) => onChange({ ...values, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm border border-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-sand-50"
            />
          </div>
        </div>
      </FilterSection>

      {/* Avaliação */}
      <FilterSection
        title="Avaliação mínima"
        isOpen={openSection === 'rating'}
        onToggle={() => toggleSection('rating')}
      >
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-3 cursor-pointer group py-0.5">
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
              values.minRating === undefined ? 'border-brand-500' : 'border-sand-300 group-hover:border-brand-400'
            )}>
              {values.minRating === undefined && <div className="w-2 h-2 rounded-full bg-brand-500" />}
            </div>
            <input type="radio" className="sr-only" checked={values.minRating === undefined} onChange={() => onChange({ ...values, minRating: undefined })} />
            <span className="text-sm text-sand-700 select-none">Todas</span>
          </label>
          {RATING_OPTIONS.map((opt) => {
            const selected = values.minRating === opt.value
            return (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer group py-0.5">
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  selected ? 'border-brand-500' : 'border-sand-300 group-hover:border-brand-400'
                )}>
                  {selected && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                </div>
                <input type="radio" className="sr-only" checked={selected} onChange={() => onChange({ ...values, minRating: opt.value })} />
                <span className="text-sm text-sand-700 select-none flex items-center gap-1">
                  {Array.from({ length: Math.floor(opt.value) }).map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-sand-500">{opt.label}</span>
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>

      {/* Cidade */}
      <FilterSection
        title="Cidade"
        isOpen={openSection === 'city'}
        onToggle={() => toggleSection('city')}
      >
        <input
          type="text"
          placeholder="Ex: São Paulo"
          value={values.city || ''}
          onChange={(e) => onChange({ ...values, city: e.target.value || undefined })}
          className="w-full px-3 py-2 text-sm border border-sand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-sand-50"
        />
      </FilterSection>
    </aside>
  )
}

function FilterSection({
  title, isOpen, onToggle, children, count,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <div className="border-b border-sand-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-sand-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-sand-700 uppercase tracking-wider">{title}</span>
          {count !== undefined && (
            <span className="w-4 h-4 bg-brand-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          className={cn('text-sand-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="px-5 pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}
