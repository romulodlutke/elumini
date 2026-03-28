'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { useAuthStore } from '@/hooks/useAuth'
import { withAuth } from '@/lib/auth-fetch'
import {
  THERAPIST_THERAPY_MODAL_OPTIONS,
  type TherapistTherapyModalOption,
  isTherapistTherapyPresetName,
} from '@/constants/therapies'
import { cn } from '@/lib/utils'
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface TherapyRow {
  id: string
  name: string
  price: number
  durationMinutes: number
  currency: string
  active: boolean
  createdAt: string
}

export default function TerapeutaTerapiasPage() {
  const { user } = useAuthStore()
  const [rows, setRows] = useState<TherapyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'pick' | 'form'>('pick')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<TherapistTherapyModalOption | null>(null)
  const [therapyName, setTherapyName] = useState('')
  const [therapyNameLocked, setTherapyNameLocked] = useState(false)
  const [formPrice, setFormPrice] = useState('')
  const [formDuration, setFormDuration] = useState('60')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/therapies', withAuth({ cache: 'no-store' }))
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setRows(data.data)
      } else {
        setRows([])
        if (!res.ok) toast.error(data.error || 'Erro ao carregar terapias')
      }
    } catch {
      toast.error('Erro de conexão')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const closeModal = () => {
    setModalOpen(false)
    setModalStep('pick')
    setEditingId(null)
    setSelectedPreset(null)
    setTherapyName('')
    setTherapyNameLocked(false)
    setFormPrice('')
    setFormDuration('60')
  }

  const openAdd = () => {
    setEditingId(null)
    setModalStep('pick')
    setSelectedPreset(null)
    setTherapyName('')
    setTherapyNameLocked(false)
    setFormPrice('')
    setFormDuration('60')
    setModalOpen(true)
  }

  const openEdit = (t: TherapyRow) => {
    setEditingId(t.id)
    setModalStep('form')
    setSelectedPreset(null)
    setTherapyName(t.name)
    setTherapyNameLocked(isTherapistTherapyPresetName(t.name))
    setFormPrice(String(t.price))
    setFormDuration(String(t.durationMinutes))
    setModalOpen(true)
  }

  const goPickToForm = () => {
    if (!selectedPreset) {
      toast.error('Selecione um tipo de terapia.')
      return
    }
    setModalStep('form')
    if (selectedPreset === 'Outras') {
      setTherapyName('')
      setTherapyNameLocked(false)
    } else {
      setTherapyName(selectedPreset)
      setTherapyNameLocked(true)
    }
    setFormPrice('')
    setFormDuration('60')
  }

  const goFormToPick = () => {
    setModalStep('pick')
    setTherapyName('')
    setTherapyNameLocked(false)
    setFormPrice('')
    setFormDuration('60')
  }

  const handleSaveTherapy = async () => {
    const name = therapyName.trim()
    if (!name) {
      toast.error('Informe o nome da terapia.')
      return
    }
    const price = parseFloat(formPrice.replace(',', '.'))
    const duration = parseInt(formDuration, 10)
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Informe um valor válido (R$).')
      return
    }
    if (!Number.isFinite(duration) || duration < 15 || duration > 480) {
      toast.error('Duração deve ser entre 15 e 480 minutos.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/therapies/${editingId}`, {
          ...withAuth({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: therapyNameLocked ? undefined : name,
              price,
              durationMinutes: duration,
            }),
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Terapia atualizada.')
          closeModal()
          await load()
        } else {
          toast.error(data.error || 'Erro ao atualizar')
        }
      } else {
        const res = await fetch('/api/therapies', {
          ...withAuth({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              price,
              durationMinutes: duration,
            }),
          }),
        })
        const data = await res.json()
        if (data.success) {
          toast.success('Terapia salva.')
          closeModal()
          await load()
        } else {
          toast.error(data.error || 'Erro ao salvar')
        }
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (t: TherapyRow) => {
    if (!confirm(`Remover "${t.name}"? Esta ação não pode ser desfeita.`)) return
    try {
      const res = await fetch(`/api/therapies/${t.id}`, withAuth({ method: 'DELETE' }))
      const data = await res.json()
      if (data.success) {
        toast.success('Terapia removida.')
        await load()
      } else {
        toast.error(data.error || 'Erro ao remover')
      }
    } catch {
      toast.error('Erro de conexão')
    }
  }

  if (!user) {
    return (
      <div>
        <Header title="Terapias que atendo" description="Gerencie tipos de terapia, valores e duração." />
        <div className="p-6">
          <p className="text-sm text-slate-600">Faça login para continuar.</p>
        </div>
      </div>
    )
  }

  const modalTitle =
    editingId != null ? 'Editar terapia' : modalStep === 'pick' ? 'Adicionar terapia' : 'Dados da sessão'

  return (
    <div>
      <Header title="Terapias que atendo" description="Cadastre as terapias que você oferece, com valor e duração por sessão." />

      <div className="p-6 max-w-2xl space-y-6 pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-600">
            As terapias aqui são as mesmas usadas na <span className="font-medium text-slate-800">agenda e no agendamento</span> pelos
            pacientes.
          </p>
          <Button type="button" onClick={openAdd} className="shrink-0">
            <Plus size={18} />
            Adicionar terapia
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-9 w-9 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white shadow-sm px-6 py-12 text-center">
            <p className="text-slate-600 text-sm mb-4">Nenhuma terapia cadastrada ainda.</p>
            <Button type="button" onClick={openAdd}>
              <Plus size={18} />
              Adicionar primeira terapia
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((t) => (
              <li
                key={t.id}
                className={cn(
                  'rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
                  !t.active && 'opacity-75 bg-slate-50/80'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                    {!t.active && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Inativa
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-medium text-green-700">
                      {t.currency === 'BRL' ? 'R$' : t.currency} {t.price.toFixed(2)}
                    </span>
                    <span className="text-slate-400 mx-2">·</span>
                    {t.durationMinutes} min
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(t)}>
                    <Pencil size={16} />
                    Editar
                  </Button>
                  <Button type="button" variant="danger" size="sm" onClick={() => handleDelete(t)}>
                    <Trash2 size={16} />
                    Remover
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        size={modalStep === 'pick' ? 'lg' : 'md'}
        className="shadow-lg sm:shadow-lg"
      >
        {modalStep === 'pick' && !editingId && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-slate-500">Selecione <span className="font-medium text-slate-700">uma</span> opção. Na próxima
              etapa você informa valor e duração.</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {THERAPIST_THERAPY_MODAL_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                    selectedPreset === opt
                      ? 'border-green-600 bg-green-50/60 ring-1 ring-green-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <input
                    type="radio"
                    name="therapy-preset"
                    checked={selectedPreset === opt}
                    onChange={() => setSelectedPreset(opt)}
                    className="h-4 w-4 border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-slate-800">{opt}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="button" onClick={goPickToForm} disabled={!selectedPreset}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {modalStep === 'form' && (
          <div className="space-y-4 pt-1">
            {!editingId && (
              <button
                type="button"
                onClick={goFormToPick}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 mb-1"
              >
                <ChevronLeft size={18} />
                Voltar à lista de tipos
              </button>
            )}

            <Input
              label="Nome da terapia"
              value={therapyName}
              onChange={(e) => setTherapyName(e.target.value)}
              disabled={therapyNameLocked}
              placeholder={therapyNameLocked ? undefined : 'Ex.: Terapia integrativa'}
              className={therapyNameLocked ? 'bg-slate-50' : ''}
            />
            {therapyNameLocked && (
              <p className="text-xs text-slate-500 -mt-2">Nome definido pelo tipo selecionado.</p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Valor da sessão (R$)"
                type="number"
                min={0}
                step="0.01"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
              />
              <Input
                label="Duração (minutos)"
                type="number"
                min={15}
                max={480}
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="button" loading={saving} onClick={handleSaveTherapy}>
                {editingId ? 'Salvar alterações' : 'Salvar terapia'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
