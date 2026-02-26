'use client'

import { cn } from '@/lib/utils'
import { Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

const THERAPY_TYPES = [
  'Reiki', 'Acupuntura', 'Meditação Guiada', 'Yoga Terapêutico',
  'Constelação Familiar', 'Florais de Bach', 'Cristaloterapia',
  'Aromaterapia', 'Hipnoterapia', 'Ayurveda', 'Fitoterapia',
  'Auriculoterapia', 'Psicologia Transpessoal', 'Pranayama',
  'Meditação Vipassana', 'Terapia Holística',
]

const RATING_OPTIONS = [
  { label: '4.5+ estrelas', value: 4.5 },
  { label: '4.0+ estrelas', value: 4.0 },
  { label: '3.5+ estrelas', value: 3.5 },
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

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const toggleTherapy = (therapy: string) => {
    const current = values.therapies
    const updated = current.includes(therapy)
      ? current.filter((t) => t !== therapy)
      : [...current, therapy]
    onChange({ ...values, therapies: updated })
  }

  const activeFilterCount = [
    values.therapies.length > 0,
    values.modality !== '',
    values.minPrice !== undefined || values.maxPrice !== undefined,
    values.minRating !== undefined,
    values.city !== undefined,
  ].filter(Boolean).length

  return (
    <aside className={cn('bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden', className)}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b border-surface-100">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary-600" />
          <span className="font-semibold text-slate-900 text-sm">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      {/* Seção: Tipo de terapia */}
      <FilterSection
        title="Tipo de terapia"
        isOpen={openSection === 'therapies'}
        onToggle={() => toggleSection('therapies')}
      >
        <div className="space-y-2">
          {THERAPY_TYPES.map((therapy) => (
            <label key={therapy} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={values.therapies.includes(therapy)}
                onChange={() => toggleTherapy(therapy)}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                {therapy}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Seção: Modalidade */}
      <FilterSection
        title="Modalidade"
        isOpen={openSection === 'modality'}
        onToggle={() => toggleSection('modality')}
      >
        <div className="space-y-2">
          {[
            { label: 'Todas', value: '' },
            { label: 'Online', value: 'ONLINE' },
            { label: 'Presencial', value: 'PRESENCIAL' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="modality"
                value={opt.value}
                checked={values.modality === opt.value}
                onChange={() => onChange({ ...values, modality: opt.value })}
                className="w-4 h-4 border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Seção: Faixa de preço */}
      <FilterSection
        title="Faixa de preço"
        isOpen={openSection === 'price'}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Mínimo</label>
            <input
              type="number"
              placeholder="R$ 0"
              value={values.minPrice || ''}
              onChange={(e) => onChange({ ...values, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Máximo</label>
            <input
              type="number"
              placeholder="R$ 500"
              value={values.maxPrice || ''}
              onChange={(e) => onChange({ ...values, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </FilterSection>

      {/* Seção: Avaliação */}
      <FilterSection
        title="Avaliação mínima"
        isOpen={openSection === 'rating'}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={values.minRating === undefined}
              onChange={() => onChange({ ...values, minRating: undefined })}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-slate-700">Todas</span>
          </label>
          {RATING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={values.minRating === opt.value}
                onChange={() => onChange({ ...values, minRating: opt.value })}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Seção: Cidade */}
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
          className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </FilterSection>
    </aside>
  )
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-surface-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-surface-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">{title}</span>
        <ChevronDown
          size={14}
          className={cn('text-slate-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
