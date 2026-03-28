'use client'

import { Header } from '@/components/dashboard/Header'
import { TherapistCard } from '@/components/therapist/TherapistCard'
import { SearchFilters, SearchFiltersValues } from '@/components/therapist/SearchFilters'
import { BookingModal } from '@/components/appointments/BookingModal'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const DEFAULT_FILTERS: SearchFiltersValues = {
  therapies: [],
  modality: '',
}

interface TherapistService {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  currency: string
  modality: string
}

interface Therapist {
  id: string
  therapies: string[]
  price: number
  modality: string
  location: string | null
  city: string | null
  state: string | null
  rating: number
  reviewCount: number
  bio: string | null
  yearsExp: number | null
  featured: boolean
  approved: boolean
  availability: any[]
  services?: TherapistService[]
  user: { id: string; name: string; avatarUrl: string | null }
}

export default function BuscarTerapeutasPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<SearchFiltersValues>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  /* Controla o drawer de filtros no mobile */
  const [filterOpen, setFilterOpen] = useState(false)

  const [bookingTherapist, setBookingTherapist] = useState<Therapist | null>(null)
  const router = useRouter()

  const activeFilterCount = [
    filters.therapies.length > 0,
    filters.modality !== '',
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.minRating !== undefined,
    !!filters.city,
  ].filter(Boolean).length

  const fetchTherapists = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), perPage: '12' })
      if (search) params.set('search', search)
      if (filters.modality) params.set('modality', filters.modality)
      if (filters.therapies.length === 1) params.set('therapy', filters.therapies[0])
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice))
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice))
      if (filters.minRating) params.set('minRating', String(filters.minRating))
      if (filters.city) params.set('city', filters.city)

      const res = await fetch(`/api/therapists?${params}`)
      const data = await res.json()
      if (data.success) {
        setTherapists(data.data.items)
        setTotal(data.data.total)
      }
    } catch {
      toast.error('Erro ao buscar terapeutas')
    } finally {
      setLoading(false)
    }
  }, [search, filters, page])

  useEffect(() => {
    const debounce = setTimeout(fetchTherapists, 300)
    return () => clearTimeout(debounce)
  }, [fetchTherapists])

  const handleBook = (therapistId: string) => {
    const t = therapists.find((t) => t.id === therapistId)
    if (t) setBookingTherapist(t)
  }

  const handleViewProfile = (therapistId: string) => {
    router.push(`/dashboard/paciente/terapeuta/${therapistId}`)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  return (
    <div>
      <Header title="Buscar Terapeutas" description="Encontre o profissional ideal para sua jornada" />

      {/*
       * Layout principal
       * Mobile (< md): coluna única; filtros abrem como drawer sobreposto
       * Desktop (md+): dois painéis lado a lado (filtros fixos à esquerda)
       */}
      <div className="flex h-[calc(100vh-56px)]">

        {/* ── Filtros — coluna lateral no desktop ───────────────────── */}
        <div className="hidden md:block w-72 flex-shrink-0 p-4 overflow-y-auto border-r border-slate-200 bg-slate-50">
          <SearchFilters
            values={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* ── Drawer de filtros para mobile (overlay) ───────────────── */}
        {filterOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
              onClick={() => setFilterOpen(false)}
            />
            {/* Painel deslizante da esquerda */}
            <div className="md:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm bg-white shadow-2xl animate-slide-up flex flex-col">
              {/* Cabeçalho do drawer */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <span className="font-semibold text-slate-900 text-sm">Filtros</span>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 pb-safe">
                <SearchFilters
                  values={filters}
                  onChange={(v) => { setFilters(v); setPage(1) }}
                  onReset={handleResetFilters}
                />
              </div>
              {/* Botão aplicar */}
              <div className="px-4 py-3 border-t border-slate-200 pb-safe">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full min-h-[44px] bg-green-600 text-white font-semibold text-sm rounded-lg
                             flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Área principal de resultados ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">

            {/* Barra de busca + controles */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">

              {/* Botão filtros — só visível no mobile */}
              <button
                onClick={() => setFilterOpen(true)}
                aria-label="Abrir filtros"
                className={cn(
                  'md:hidden flex-shrink-0 flex items-center justify-center gap-1.5',
                  'min-h-[44px] min-w-[44px] px-3 rounded-xl border transition-colors text-sm font-medium',
                  activeFilterCount > 0
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <SlidersHorizontal size={16} />
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Campo de busca */}
              <div className="flex-1">
                <Input
                  placeholder="Buscar terapeuta..."
                  leftIcon={<Search size={16} />}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>

              {/* Toggle grid / list */}
              <div className="flex gap-1 border border-slate-200 bg-white rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Visualização em grade"
                  className={cn(
                    'p-2 min-h-[36px] min-w-[36px] rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-green-50 text-green-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="Visualização em lista"
                  className={cn(
                    'p-2 min-h-[36px] min-w-[36px] rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-green-50 text-green-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Contagem de resultados */}
            {!loading && (
              <p className="text-sm text-slate-500 mb-4">
                {total} terapeuta{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid / lista de terapeutas */}
            {loading ? (
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : therapists.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">Nenhum terapeuta encontrado</h3>
                <p className="text-sm text-slate-400">Tente ajustar os filtros ou a busca</p>
              </div>
            ) : (
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {therapists.map((therapist) => (
                  <TherapistCard
                    key={therapist.id}
                    therapist={therapist}
                    variant={viewMode}
                    onBook={handleBook}
                    onView={handleViewProfile}
                  />
                ))}
              </div>
            )}

            {/* Paginação — botões com alvo de toque adequado */}
            {total > 12 && !loading && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 min-h-[44px] rounded-lg border border-slate-200 text-sm font-medium
                             disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 min-h-[44px] flex items-center text-sm text-slate-600">
                  {page} / {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="px-4 min-h-[44px] rounded-lg border border-slate-200 text-sm font-medium
                             disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de agendamento */}
      {bookingTherapist && (
        <BookingModal
          isOpen={!!bookingTherapist}
          onClose={() => setBookingTherapist(null)}
          therapist={bookingTherapist}
          onSuccess={() => {
            setBookingTherapist(null)
            toast.success('Agendamento realizado! Aguarde a confirmação.')
          }}
        />
      )}
    </div>
  )
}
