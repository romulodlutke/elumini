'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency, getAvatarUrl } from '@/lib/utils'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

interface Therapist {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  createdAt: string
  active: boolean
  therapistProfile: {
    id: string
    therapies: string[]
    price: number
    modality: string
    city: string | null
    rating: number
    reviewCount: number
    approved: boolean
    yearsExp: number | null
  } | null
}

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

  useEffect(() => {
    loadTherapists()
  }, [])

  const loadTherapists = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users?role=TERAPEUTA')
      const data = await res.json()
      if (data.success) setTherapists(data.data || [])
    } catch {
      toast.error('Erro ao carregar terapeutas')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(approved ? 'Terapeuta aprovado!' : 'Terapeuta reprovado')
        loadTherapists()
      }
    } catch {
      toast.error('Erro ao atualizar terapeuta')
    }
  }

  const handleToggleActive = async (userId: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(active ? 'Usuário ativado' : 'Usuário desativado')
        loadTherapists()
      }
    } catch {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const filtered = therapists.filter((t) => {
    if (filter === 'pending') return t.therapistProfile && !t.therapistProfile.approved
    if (filter === 'approved') return t.therapistProfile?.approved
    return true
  })

  return (
    <div>
      <Header title="Gerenciar Terapeutas" description="Aprovar, revisar e gerenciar terapeutas" />
      <div className="p-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Aguardando aprovação' : 'Aprovados'}
              {f === 'pending' && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {therapists.filter((t) => t.therapistProfile && !t.therapistProfile.approved).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Nenhum terapeuta encontrado</div>
          ) : (
            filtered.map((therapist) => (
              <div key={therapist.id} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-card">
                <div className="flex items-center gap-4">
                  <Image
                    src={getAvatarUrl(therapist.name, therapist.avatarUrl)}
                    alt={therapist.name}
                    width={56}
                    height={56}
                    className="rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{therapist.name}</h3>
                      {therapist.therapistProfile?.approved ? (
                        <Badge variant="success" size="sm">Aprovado</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">Pendente</Badge>
                      )}
                      {!therapist.active && <Badge variant="danger" size="sm">Inativo</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{therapist.email}</p>
                    {therapist.therapistProfile && (
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">
                          {therapist.therapistProfile.therapies.slice(0, 2).join(', ')}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {formatCurrency(therapist.therapistProfile.price)}/sessão
                        </span>
                        <StarRating value={therapist.therapistProfile.rating} size="sm" showValue />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!therapist.therapistProfile?.approved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(therapist.id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={14} />
                        Aprovar
                      </Button>
                    )}
                    {therapist.therapistProfile?.approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(therapist.id, false)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle size={14} />
                        Reprovar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={therapist.active ? 'danger' : 'secondary'}
                      onClick={() => handleToggleActive(therapist.id, !therapist.active)}
                    >
                      {therapist.active ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
