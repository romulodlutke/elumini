'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency, generateTimeSlots, modalityLabels } from '@/lib/utils'
import { useState } from 'react'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Availability {
  dayOfWeek: number
  startTime: string
  endTime: string
  slotDuration: number
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

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  therapist: {
    id: string
    price: number | string
    user: { name: string }
    availability: Availability[]
    services?: TherapistService[]
  }
  onSuccess?: () => void
}

export function BookingModal({ isOpen, onClose, therapist, onSuccess }: BookingModalProps) {
  const hasServices = therapist.services && therapist.services.length > 0

  const steps = hasServices ? ['service', 'date', 'time', 'confirm'] : ['date', 'time', 'confirm']
  const [step, setStep] = useState<'service' | 'date' | 'time' | 'confirm' | 'done'>(
    hasServices ? 'service' : 'date'
  )
  const [selectedService, setSelectedService] = useState<TherapistService | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()))

  const daysInView = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const price = selectedService ? selectedService.price : Number(therapist.price)
  const durationMinutes = selectedService ? selectedService.durationMinutes : 60
  const currency = selectedService ? selectedService.currency : 'BRL'
  const modality = selectedService ? selectedService.modality : 'AMBOS'
  const serviceDescription = selectedService?.description ?? null

  const getAvailableSlotsForDate = (date: Date): string[] => {
    const dayOfWeek = date.getDay()
    const avail = therapist.availability.find((a) => a.dayOfWeek === dayOfWeek)
    if (!avail) return []
    const slots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[BookingModal] horários gerados', {
        date: format(date, 'yyyy-MM-dd'),
        dayOfWeek,
        start: avail.startTime,
        end: avail.endTime,
        slotDuration: avail.slotDuration,
        slots,
      })
    }
    return slots
  }

  const isDateAvailable = (date: Date): boolean => {
    if (date < startOfDay(new Date())) return false
    const dayOfWeek = date.getDay()
    return therapist.availability.some((a) => a.dayOfWeek === dayOfWeek)
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return
    setLoading(true)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistProfileId: therapist.id,
          date: dateStr,
          time: selectedTime,
          notes: notes || undefined,
          serviceId: selectedService?.id || undefined,
        }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setStep('done')
      toast.success('Agendamento solicitado com sucesso!')
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'Erro ao agendar')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(hasServices ? 'service' : 'date')
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setNotes('')
    onClose()
  }

  const goBack = () => {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1] as typeof step)
  }

  const goNext = () => {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1] as typeof step)
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agendar sessão" size="lg">
      {step === 'done' ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Solicitação enviada!</h3>
          <p className="text-slate-500 text-sm mb-6">
            Aguarde a confirmação de <strong>{therapist.user.name}</strong>. Você receberá uma notificação quando confirmado.
          </p>
          <Button onClick={handleClose} fullWidth>Fechar</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Steps indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                    step === s ? 'bg-primary-600 text-white' :
                    steps.indexOf(step) > i ? 'bg-primary-100 text-primary-700' :
                    'bg-surface-100 text-slate-400'
                  )}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('w-8 h-0.5 mx-1', steps.indexOf(step) > i ? 'bg-primary-300' : 'bg-surface-200')} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 0: Escolher serviço (quando terapeuta tem serviços) */}
          {step === 'service' && hasServices && (
            <div>
              <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-primary-600" />
                Escolha o tipo de serviço
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Selecione o serviço desejado. As informações de duração, preço e formato serão preenchidas automaticamente.
              </p>
              <div className="space-y-2">
                {therapist.services!.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setSelectedService(svc)
                      goNext()
                    }}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all',
                      selectedService?.id === svc.id
                        ? 'border-primary-600 bg-primary-50 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-primary-300 hover:bg-surface-50'
                    )}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{svc.name}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {svc.durationMinutes} min • {modalityLabels[svc.modality] || svc.modality}
                        </p>
                        {svc.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                        )}
                      </div>
                      <p className="font-bold text-slate-900 flex-shrink-0">
                        {formatCurrency(svc.price, svc.currency)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1: Selecionar data */}
          {step === 'date' && (
            <div>
              <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary-600" />
                Selecione a data
              </h4>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setWeekStart(addDays(weekStart, -7))}
                  disabled={weekStart <= startOfDay(new Date())}
                  className="p-1.5 rounded-lg hover:bg-surface-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {format(daysInView[0], "d MMM", { locale: ptBR })} — {format(daysInView[6], "d MMM yyyy", { locale: ptBR })}
                </span>
                <button
                  onClick={() => setWeekStart(addDays(weekStart, 7))}
                  className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {daysInView.map((date) => {
                  const available = isDateAvailable(date)
                  const selected = selectedDate?.toDateString() === date.toDateString()
                  return (
                    <button
                      key={date.toISOString()}
                      disabled={!available}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'flex flex-col items-center p-2 rounded-xl text-xs transition-all',
                        available ? 'hover:bg-primary-50 cursor-pointer' : 'opacity-30 cursor-not-allowed',
                        selected ? 'bg-primary-600 text-white shadow-md' : 'bg-surface-50'
                      )}
                    >
                      <span className={cn('font-medium mb-1', selected ? 'text-white' : 'text-slate-400')}>
                        {format(date, 'EEE', { locale: ptBR }).slice(0, 3)}
                      </span>
                      <span className={cn('font-bold text-sm', selected ? 'text-white' : available ? 'text-slate-900' : 'text-slate-300')}>
                        {format(date, 'd')}
                      </span>
                      {available && !selected && (
                        <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex gap-2 justify-between">
                {hasServices && (
                  <Button variant="outline" onClick={goBack}>← Voltar</Button>
                )}
                <Button disabled={!selectedDate} onClick={goNext} className={hasServices ? '' : 'ml-auto'}>
                  Próximo →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Selecionar horário */}
          {step === 'time' && selectedDate && (
            <div>
              <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                Selecione o horário
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              {(() => {
                const slots = getAvailableSlotsForDate(selectedDate)
                return slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={cn(
                          'py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                          selectedTime === slot
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white border-surface-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl text-amber-700 text-sm">
                    <AlertCircle size={16} />
                    Nenhum horário disponível para esta data.
                  </div>
                )
              })()}
              <div className="mt-5 flex gap-2 justify-between">
                <Button variant="outline" onClick={goBack}>← Voltar</Button>
                <Button disabled={!selectedTime} onClick={goNext}>Próximo →</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmar */}
          {step === 'confirm' && selectedDate && selectedTime && (
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Confirmar agendamento</h4>
              <div className="bg-surface-50 rounded-xl p-4 space-y-3 mb-4">
                {selectedService && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Serviço</span>
                    <span className="font-medium text-slate-900">{selectedService.name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Terapeuta</span>
                  <span className="font-medium text-slate-900">{therapist.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Data</span>
                  <span className="font-medium text-slate-900">
                    {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Horário</span>
                  <span className="font-medium text-slate-900">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duração</span>
                  <span className="font-medium text-slate-900">{durationMinutes} minutos</span>
                </div>
                {serviceDescription && (
                  <div className="text-sm pt-2 border-t border-surface-200">
                    <span className="text-slate-500 block mb-1">Descrição</span>
                    <span className="text-slate-700">{serviceDescription}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-surface-200 pt-3">
                  <span className="text-slate-500">Valor</span>
                  <span className="font-bold text-slate-900">{formatCurrency(price, currency)}</span>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: primeira consulta, assunto específico..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="flex-1">← Voltar</Button>
                <Button loading={loading} onClick={handleBook} className="flex-2 flex-1">
                  Confirmar agendamento
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
