'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency, formatDateTime, appointmentStatusConfig } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  status: string
  price: number
  notes: string | null
  therapist: {
    id: string
    therapies: string[]
    user: { name: string; avatarUrl: string | null }
  }
  review: { rating: number; comment: string | null } | null
}

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [reviewModal, setReviewModal] = useState<{ appointmentId: string; therapistName: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => { loadAppointments() }, [statusFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ perPage: '20' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/appointments?${params}`)
      const data = await res.json()
      if (data.success) setAppointments(data.data.items)
    } catch {
      toast.error('Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja cancelar este agendamento?')) return
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELADO', cancelReason: 'Cancelado pelo paciente' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Agendamento cancelado')
        loadAppointments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro ao cancelar')
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewModal) return
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: reviewModal.appointmentId, rating, comment }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Avaliação enviada! Obrigado.')
        setReviewModal(null)
        setRating(5)
        setComment('')
        loadAppointments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setSubmittingReview(false)
    }
  }

  const statusTabs = [
    { value: '', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendentes' },
    { value: 'CONFIRMADO', label: 'Confirmados' },
    { value: 'CONCLUIDO', label: 'Concluídos' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ]

  const statusVariant: Record<string, any> = {
    PENDENTE: 'warning', CONFIRMADO: 'success', CONCLUIDO: 'info', CANCELADO: 'danger',
  }

  return (
    <div>
      <Header title="Meus Agendamentos" description="Histórico e próximas sessões" />

      <div className="p-6 space-y-4">
        {/* Tabs de status */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Nenhum agendamento encontrado</div>
          ) : (
            appointments.map((apt) => {
                    const statusConfig = appointmentStatusConfig[apt.status as keyof typeof appointmentStatusConfig] || { label: apt.status, color: 'bg-slate-100 text-slate-700' }
              const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.therapist.user.name)}&background=14b8a6&color=fff&size=64`

              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-card">
                  <div className="flex items-center gap-4">
                    <Image
                      src={apt.therapist.user.avatarUrl || avatarFallback}
                      alt={apt.therapist.user.name}
                      width={56}
                      height={56}
                      className="rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{apt.therapist.user.name}</h3>
                        <Badge variant={statusVariant[apt.status]} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{apt.therapist.therapies[0]}</p>
                      <p className="text-sm text-slate-600 mt-1">{formatDateTime(apt.date)}</p>
                      {apt.notes && <p className="text-xs text-slate-400 mt-1 italic">"{apt.notes}"</p>}

                      {/* Avaliação existente */}
                      {apt.review && (
                        <div className="mt-2 flex items-center gap-2">
                          <StarRating value={apt.review.rating} size="sm" />
                          {apt.review.comment && (
                            <span className="text-xs text-slate-500 italic">"{apt.review.comment}"</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="font-bold text-slate-900">{formatCurrency(Number(apt.price))}</span>
                      <div className="flex gap-2">
                        {apt.status === 'CONCLUIDO' && !apt.review && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setReviewModal({ appointmentId: apt.id, therapistName: apt.therapist.user.name })}
                          >
                            <MessageSquare size={14} />
                            Avaliar
                          </Button>
                        )}
                        {(apt.status === 'PENDENTE' || apt.status === 'CONFIRMADO') && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal de avaliação */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title="Avaliar sessão"
        size="sm"
      >
        {reviewModal && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Como foi sua sessão com <strong>{reviewModal.therapistName}</strong>?
            </p>
            <div className="flex justify-center">
              <StarRating
                value={rating}
                size="lg"
                readOnly={false}
                onChange={setRating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comentário (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência..."
                rows={3}
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <Button fullWidth loading={submittingReview} onClick={handleSubmitReview}>
              Enviar avaliação
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
