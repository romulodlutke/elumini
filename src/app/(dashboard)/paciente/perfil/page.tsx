'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { Save, Lock } from 'lucide-react'

export default function PacientePerfilPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [historicoEmocional, setHistoricoEmocional] = useState('')
  const [medicamentos, setMedicamentos] = useState('')
  const [alergias, setAlergias] = useState('')
  const [expectativas, setExpectativas] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!user) return
    fetch(`/api/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name || '')
          setPhone(data.data.phone || '')
          const a = data.data.patientProfile?.anamnese
          if (a) {
            setObjetivo(a.objetivo || '')
            setHistoricoEmocional(a.historicoEmocional || '')
            setMedicamentos(a.medicamentos || '')
            setAlergias(a.alergias || '')
            setExpectativas(a.expectativas || '')
          }
        }
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const payload: any = { name, phone }
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Perfil atualizado!')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Meu Perfil" description="Gerencie suas informações pessoais" />
      <div className="p-6 max-w-2xl space-y-6">
        {/* Dados pessoais */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Dados pessoais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {/* Anamnese */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900">Ficha de anamnese</h2>
          <p className="text-sm text-slate-500">
            Estas informações ajudam os terapeutas a entender suas necessidades.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Objetivo terapêutico</label>
            <textarea
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              rows={2}
              placeholder="Ex: Reduzir ansiedade, desenvolver autoconhecimento..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Histórico emocional</label>
            <textarea
              value={historicoEmocional}
              onChange={(e) => setHistoricoEmocional(e.target.value)}
              rows={2}
              placeholder="Ex: Histórico de ansiedade, passando por luto..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Uso de medicamentos</label>
              <input
                value={medicamentos}
                onChange={(e) => setMedicamentos(e.target.value)}
                placeholder="Ex: Antidepressivo, nenhum..."
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alergias</label>
              <input
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                placeholder="Ex: Nenhuma, amendoim..."
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Expectativas</label>
            <textarea
              value={expectativas}
              onChange={(e) => setExpectativas(e.target.value)}
              rows={2}
              placeholder="O que você espera alcançar com as terapias?"
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Alterar senha */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Lock size={16} className="text-slate-500" />
            Alterar senha
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Senha atual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            <Input label="Nova senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mín. 8 caracteres" hint="Deixe em branco para manter a atual" />
          </div>
        </div>

        <Button size="lg" loading={loading} onClick={handleSave} fullWidth>
          <Save size={18} />
          Salvar alterações
        </Button>
      </div>
    </div>
  )
}
