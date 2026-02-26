'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime, appointmentStatusConfig } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Check } from 'lucide-react'

interface Appointment {
  id: string
  date: string
  status: string
  price: number
  therapistNet: number | null
  notes: string | null
  patient: {
    user: { name: string; avatarUrl: string | null }
  }
  review: { rating: number } | null
}

export default function TerapeutaAgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { loadAppointments() }, [statusFilter])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ perPage: '30' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/appointments?${params}`)
      const data = await res.json()
      if (data.success) setAppointments(data.data.items)
    } catch {
      toast.error('Erro ao carregar agenda')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Agendamento ${status === 'CONFIRMADO' ? 'confirmado' : status === 'CONCLUIDO' ? 'concluído' : 'cancelado'}`)
        loadAppointments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  const statusVariant: Record<string, any> = {
    PENDENTE: 'warning', CONFIRMADO: 'success', CONCLUIDO: 'info', CANCELADO: 'danger',
  }

  const statusTabs = [
    { value: '', label: 'Todos' },
    { value: 'PENDENTE', label: 'Pendentes' },
    { value: 'CONFIRMADO', label: 'Confirmados' },
    { value: 'CONCLUIDO', label: 'Concluídos' },
    { value: 'CANCELADO', label: 'Cancelados' },
  ]

  return (
    <div>
      <Header title="Minha Agenda" description="Gerencie seus agendamentos" />

      <div className="p-6 space-y-4">
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
              {tab.value === 'PENDENTE' && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {appointments.filter((a) => a.status === 'PENDENTE').length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Carregando...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Nenhum agendamento encontrado</div>
          ) : (
            appointments.map((apt) => {
                    const statusConfig = appointmentStatusConfig[apt.status as keyof typeof appointmentStatusConfig] || { label: apt.status, color: 'bg-slate-100 text-slate-700' }
              const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(apt.patient.user.name)}&background=6366f1&color=fff&size=64`

              return (
                <div key={apt.id} className="bg-white rounded-2xl border border-surface-200 p-5 shadow-card">
                  <div className="flex items-center gap-4">
                    <Image
                      src={apt.patient.user.avatarUrl || avatarFallback}
                      alt={apt.patient.user.name}
                      width={52}
                      height={52}
                      className="rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{apt.patient.user.name}</h3>
                        <Badge variant={statusVariant[apt.status]} size="sm">
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{formatDateTime(apt.date)}</p>
                      {apt.notes && <p className="text-xs text-slate-400 mt-1 italic">"{apt.notes}"</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(Number(apt.price))}</p>
                        {apt.therapistNet && (
                          <p className="text-xs text-green-600">Líquido: {formatCurrency(Number(apt.therapistNet))}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {apt.status === 'PENDENTE' && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(apt.id, 'CONFIRMADO')}>
                              <CheckCircle size={14} />
                              Confirmar
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(apt.id, 'CANCELADO')}>
                              <XCircle size={14} />
                              Recusar
                            </Button>
                          </>
                        )}
                        {apt.status === 'CONFIRMADO' && (
                          <Button size="sm" variant="secondary" onClick={() => updateStatus(apt.id, 'CONCLUIDO')}>
                            <Check size={14} />
                            Concluir
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
    </div>
  )
}
