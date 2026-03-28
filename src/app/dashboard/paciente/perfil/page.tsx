'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/hooks/useAuth'
import { withAuth } from '@/lib/auth-fetch'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Save, Lock, CheckCircle2, AlertCircle } from 'lucide-react'

const emptyAnamnesis = {
  objetivo: '',
  historicoEmocional: '',
  medicamentos: '',
  alergias: '',
  expectativas: '',
}

type FormData = {
  name: string
  email: string
  phone: string
  anamnesis: typeof emptyAnamnesis
}

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  anamnesis: { ...emptyAnamnesis },
}

export default function PacientePerfilPage() {
  const { user, setUser } = useAuthStore()
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [])

  const loadProfile = useCallback(async () => {
    setLoadState('loading')
    try {
      const res = await fetch('/api/profile', withAuth())
      const data = await res.json()
      if (!data.success) {
        console.error('[Meu Perfil] GET /api/profile', data.error)
        setFormData(initialForm)
        setLoadState('error')
        return
      }
      const d = data.data
      setFormData({
        name: d.name ?? '',
        email: d.email ?? '',
        phone: d.phone ?? '',
        anamnesis: {
          objetivo: d.anamnesis?.objetivo ?? '',
          historicoEmocional: d.anamnesis?.historicoEmocional ?? '',
          medicamentos: d.anamnesis?.medicamentos ?? '',
          alergias: d.anamnesis?.alergias ?? '',
          expectativas: d.anamnesis?.expectativas ?? '',
        },
      })
      setLoadState('ready')
    } catch (e) {
      console.error('[Meu Perfil] GET /api/profile', e)
      setFormData(initialForm)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user, loadProfile])

  const setAnamnesisField = (field: keyof typeof emptyAnamnesis, value: string) => {
    setFormData((prev) => ({
      ...prev,
      anamnesis: { ...prev.anamnesis, [field]: value },
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone,
        anamnesis: formData.anamnesis,
      }
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }

      const res = await fetch(
        '/api/profile',
        withAuth({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      )
      const data = await res.json()
      if (data.success) {
        const d = data.data
        setFormData({
          name: d.name ?? '',
          email: d.email ?? '',
          phone: d.phone ?? '',
          anamnesis: {
            objetivo: d.anamnesis?.objetivo ?? '',
            historicoEmocional: d.anamnesis?.historicoEmocional ?? '',
            medicamentos: d.anamnesis?.medicamentos ?? '',
            alergias: d.anamnesis?.alergias ?? '',
            expectativas: d.anamnesis?.expectativas ?? '',
          },
        })
        setUser({
          ...user,
          name: d.name ?? user.name,
        })
        setCurrentPassword('')
        setNewPassword('')
        setShowError(false)
        setShowSuccess(true)
        if (successTimerRef.current) clearTimeout(successTimerRef.current)
        successTimerRef.current = setTimeout(() => setShowSuccess(false), 3000)
      } else {
        console.error('[Meu Perfil] PUT /api/profile', data.error)
        setShowSuccess(false)
        setShowError(true)
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setShowError(false), 4000)
      }
    } catch (e) {
      console.error('[Meu Perfil] PUT /api/profile', e)
      setShowSuccess(false)
      setShowError(true)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = setTimeout(() => setShowError(false), 4000)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return null
  }

  if (loadState === 'loading' || loadState === 'idle') {
    return (
      <div>
        <Header title="Meu Perfil" description="Gerencie suas informações pessoais" />
        <div className="p-6 max-w-2xl space-y-6" aria-busy="true">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-surface-200 rounded w-40" />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="h-11 bg-surface-200 rounded-xl" />
              <div className="h-11 bg-surface-200 rounded-xl" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4 animate-pulse">
            <div className="h-5 bg-surface-200 rounded w-48" />
            <div className="h-20 bg-surface-200 rounded-xl" />
            <div className="h-20 bg-surface-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div>
        <Header title="Meu Perfil" description="Gerencie suas informações pessoais" />
        <div className="p-6 max-w-2xl">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 text-center space-y-4">
            <p className="text-slate-600">Não foi possível carregar seu perfil.</p>
            <Button type="button" onClick={() => loadProfile()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg ring-1 ring-white/20 animate-slide-up"
        >
          <CheckCircle2 size={20} className="shrink-0 opacity-95" aria-hidden />
          INFORMAÇÕES SALVAS
        </div>
      )}
      {showError && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/20 animate-slide-up"
        >
          <AlertCircle size={20} className="shrink-0 opacity-95" aria-hidden />
          Erro ao salvar informações
        </div>
      )}
      <Header title="Meu Perfil" description="Gerencie suas informações pessoais" />
      <div className="p-6 max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Dados pessoais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="E-mail"
              value={formData.email}
              onChange={() => {}}
              disabled
              hint="O e-mail não pode ser alterado aqui"
            />
            <div className="sm:col-span-2">
              <Input
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Ficha de anamnese</h2>
          <p className="text-sm text-slate-500">
            Estas informações ajudam os terapeutas a entender suas necessidades.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Objetivo terapêutico</label>
            <textarea
              value={formData.anamnesis.objetivo}
              onChange={(e) => setAnamnesisField('objetivo', e.target.value)}
              rows={2}
              placeholder="Ex: Reduzir ansiedade, desenvolver autoconhecimento..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Histórico emocional</label>
            <textarea
              value={formData.anamnesis.historicoEmocional}
              onChange={(e) => setAnamnesisField('historicoEmocional', e.target.value)}
              rows={2}
              placeholder="Ex: Histórico de ansiedade, passando por luto..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Uso de medicamentos</label>
              <input
                value={formData.anamnesis.medicamentos}
                onChange={(e) => setAnamnesisField('medicamentos', e.target.value)}
                placeholder="Ex: Antidepressivo, nenhum..."
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alergias</label>
              <input
                value={formData.anamnesis.alergias}
                onChange={(e) => setAnamnesisField('alergias', e.target.value)}
                placeholder="Ex: Nenhuma, amendoim..."
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Expectativas</label>
            <textarea
              value={formData.anamnesis.expectativas}
              onChange={(e) => setAnamnesisField('expectativas', e.target.value)}
              rows={2}
              placeholder="O que você espera alcançar com as terapias?"
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lock size={16} className="text-slate-500" />
            Alterar senha
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mín. 8 caracteres"
              hint="Deixe em branco para manter a atual"
            />
          </div>
        </div>

        <Button size="lg" loading={saving} onClick={handleSave} fullWidth>
          <Save size={18} />
          Salvar alterações
        </Button>
      </div>
    </div>
  )
}
