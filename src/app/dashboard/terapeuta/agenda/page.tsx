'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDateTime, appointmentStatusConfig } from '@/lib/utils'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Check, Clock, Save, Plus, Trash2, CalendarDays } from 'lucide-react'

// ============================================================
// TIPOS
// ============================================================

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

interface AvailabilitySlot {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
  active: boolean
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const TIME_OPTIONS: string[] = []
for (let h = 6; h <= 22; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`)
}

const DURATION_OPTIONS = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '1 hora' },
  { value: 90,  label: '1h30' },
  { value: 120, label: '2 horas' },
]

const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo',   label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus',     label: 'Manaus (GMT-4)' },
  { value: 'America/Fortaleza',  label: 'Fortaleza (GMT-3)' },
  { value: 'America/Recife',     label: 'Recife (GMT-3)' },
  { value: 'America/Cuiaba',     label: 'Cuiabá (GMT-4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (GMT-4)' },
  { value: 'Europe/Lisbon',      label: 'Lisboa (GMT+0/+1)' },
  { value: 'Europe/London',      label: 'Londres (GMT+0/+1)' },
  { value: 'America/New_York',  label: 'Nova York (GMT-5/-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/-7)' },
]

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function TerapeutaAgendaPage() {
  const [tab, setTab] = useState<'appointments' | 'availability'>('appointments')

  // — Agendamentos —
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingApts, setLoadingApts] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  // — Disponibilidade —
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [loadingAvail, setLoadingAvail] = useState(true)
  const [savingAvail, setSavingAvail] = useState(false)

  // ——————————————————————————
  // AGENDAMENTOS
  // ——————————————————————————

  useEffect(() => { loadAppointments() }, [statusFilter])

  const loadAppointments = async () => {
    setLoadingApts(true)
    try {
      const params = new URLSearchParams({ perPage: '30' })
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/appointments?${params}`)
      const data = await res.json()
      if (data.success) setAppointments(data.data.items)
    } catch {
      toast.error('Erro ao carregar agenda')
    } finally {
      setLoadingApts(false)
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
        toast.success(
          status === 'CONFIRMADO' ? 'Agendamento confirmado' :
          status === 'CONCLUIDO' ? 'Agendamento concluído' : 'Agendamento cancelado'
        )
        loadAppointments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  // ——————————————————————————
  // DISPONIBILIDADE
  // ——————————————————————————

  useEffect(() => {
    if (tab === 'availability') loadAvailability()
  }, [tab])

  const loadAvailability = async () => {
    setLoadingAvail(true)
    try {
      const res = await fetch('/api/availability')
      const data = await res.json()
      if (data.success) {
        setSlots(data.data)
        if (data.timezone) setTimezone(data.timezone)
      }
    } catch {
      toast.error('Erro ao carregar disponibilidade')
    } finally {
      setLoadingAvail(false)
    }
  }

  const addSlot = (dayOfWeek: number) => {
    setSlots((prev) => [
      ...prev,
      { dayOfWeek, startTime: '09:00', endTime: '18:00', slotDuration: 60, active: true },
    ])
  }

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const saveAvailability = async () => {
    setSavingAvail(true)
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, timezone }),
      })
      const data = await res.json()
      if (data.success) {
        setSlots(data.data)
        if (data.timezone) setTimezone(data.timezone)
        toast.success('Disponibilidade salva com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSavingAvail(false)
    }
  }

  // ——————————————————————————
  // RENDER
  // ——————————————————————————

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
      <Header title="Minha Agenda" description="Gerencie seus agendamentos e horários de atendimento" />

      {/* Tabs principais */}
      <div className="flex gap-1 px-6 pt-4 border-b border-surface-200">
        <button
          onClick={() => setTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'appointments'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarDays size={15} />
          Agendamentos
        </button>
        <button
          onClick={() => setTab('availability')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'availability'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock size={15} />
          Horários de atendimento
        </button>
      </div>

      {/* ===== TAB: AGENDAMENTOS ===== */}
      {tab === 'appointments' && (
        <div className="p-6 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setStatusFilter(t.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === t.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
                }`}
              >
                {t.label}
                {t.value === 'PENDENTE' && (
                  <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {appointments.filter((a) => a.status === 'PENDENTE').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loadingApts ? (
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
      )}

      {/* ===== TAB: HORÁRIOS DE ATENDIMENTO ===== */}
      {tab === 'availability' && (
        <div className="p-6 max-w-3xl space-y-4">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-semibold text-slate-900">Horários de atendimento</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Configure os dias e horários em que você atende. Os pacientes poderão agendar apenas nesses horários.
                </p>
              </div>
              <Button loading={savingAvail} onClick={saveAvailability}>
                <Save size={15} />
                Salvar
              </Button>
            </div>

            <div className="mb-5 p-4 rounded-xl bg-surface-50 border border-surface-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Fuso horário</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">Os horários abaixo são considerados neste fuso.</p>
            </div>

            {loadingAvail ? (
              <div className="text-center py-8 text-slate-400">Carregando...</div>
            ) : (
              <div className="space-y-3">
                {/* Dias sem horário cadastrado */}
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const daySlots = slots
                    .map((s, i) => ({ ...s, index: i }))
                    .filter((s) => s.dayOfWeek === day)

                  return (
                    <div key={day} className="border border-surface-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-surface-50">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-white border border-surface-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {DAYS_SHORT[day]}
                          </span>
                          <span className="font-medium text-slate-800 text-sm">{DAYS[day]}</span>
                          {daySlots.length > 0 && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                              {daySlots.length} turno{daySlots.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addSlot(day)}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50"
                        >
                          <Plus size={13} />
                          Adicionar turno
                        </button>
                      </div>

                      {daySlots.length > 0 && (
                        <div className="divide-y divide-surface-100">
                          {daySlots.map((slot) => (
                            <div key={slot.index} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 w-10">Início</label>
                                <select
                                  value={slot.startTime}
                                  onChange={(e) => updateSlot(slot.index, 'startTime', e.target.value)}
                                  className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                                >
                                  {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 w-8">Fim</label>
                                <select
                                  value={slot.endTime}
                                  onChange={(e) => updateSlot(slot.index, 'endTime', e.target.value)}
                                  className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                                >
                                  {TIME_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-slate-500 w-14">Duração</label>
                                <select
                                  value={slot.slotDuration}
                                  onChange={(e) => updateSlot(slot.index, 'slotDuration', Number(e.target.value))}
                                  className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                                >
                                  {DURATION_OPTIONS.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                onClick={() => removeSlot(slot.index)}
                                className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {daySlots.length === 0 && (
                        <div className="px-4 py-2.5 text-xs text-slate-400 italic">
                          Sem atendimento neste dia
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <p className="text-xs text-slate-400 mt-4">
              * Os horários são semanais e se repetem toda semana. Para pausar um dia, remova os turnos correspondentes.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
