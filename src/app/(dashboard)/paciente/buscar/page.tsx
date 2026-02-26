'use client'

import { Header } from '@/components/dashboard/Header'
import { TherapistCard } from '@/components/therapist/TherapistCard'
import { SearchFilters, SearchFiltersValues } from '@/components/therapist/SearchFilters'
import { BookingModal } from '@/components/appointments/BookingModal'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { Search, LayoutGrid, List } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const DEFAULT_FILTERS: SearchFiltersValues = {
  therapies: [],
  modality: '',
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

  const [bookingTherapist, setBookingTherapist] = useState<Therapist | null>(null)

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

  return (
    <div>
      <Header title="Buscar Terapeutas" description="Encontre o profissional ideal para sua jornada" />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar de filtros */}
        <div className="w-72 flex-shrink-0 p-4 overflow-y-auto border-r border-surface-200 bg-surface-50">
          <SearchFilters
            values={filters}
            onChange={setFilters}
            onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1) }}
          />
        </div>

        {/* Área principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Barra de busca e controles */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome do terapeuta..."
                  leftIcon={<Search size={16} />}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
              <div className="flex gap-1 border border-surface-200 bg-white rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Resultado count */}
            {!loading && (
              <p className="text-sm text-slate-500 mb-4">
                {total} terapeuta{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            )}

            {/* Grid/List de terapeutas */}
            {loading ? (
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : therapists.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  />
                ))}
              </div>
            )}

            {/* Paginação */}
            {total > 12 && !loading && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium disabled:opacity-40 hover:bg-surface-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm text-slate-600">
                  Página {page} de {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-medium disabled:opacity-40 hover:bg-surface-50 transition-colors"
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
