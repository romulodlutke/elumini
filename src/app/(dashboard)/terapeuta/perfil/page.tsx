'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { X, Plus, Save } from 'lucide-react'

const THERAPY_OPTIONS = [
  'Reiki', 'Acupuntura', 'Meditação Guiada', 'Yoga Terapêutico',
  'Constelação Familiar', 'Florais de Bach', 'Cristaloterapia',
  'Aromaterapia', 'Hipnoterapia', 'Ayurveda', 'Fitoterapia',
  'Auriculoterapia', 'Psicologia Transpessoal', 'Pranayama',
]

export default function TerapeutaPerfilPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('')
  const [modality, setModality] = useState('AMBOS')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [newCert, setNewCert] = useState('')

  useEffect(() => {
    if (!user) return
    fetch(`/api/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name || '')
          setPhone(data.data.phone || '')
          const tp = data.data.therapistProfile
          if (tp) {
            setProfileId(tp.id)
            setBio(tp.bio || '')
            setPrice(String(tp.price || ''))
            setModality(tp.modality || 'AMBOS')
            setLocation(tp.location || '')
            setCity(tp.city || '')
            setState(tp.state || '')
            setYearsExp(String(tp.yearsExp || ''))
            setSelectedTherapies(tp.therapies || [])
            setCertifications(tp.certifications || [])
          }
        }
      })
  }, [user])

  const toggleTherapy = (therapy: string) => {
    setSelectedTherapies((prev) =>
      prev.includes(therapy) ? prev.filter((t) => t !== therapy) : [...prev, therapy]
    )
  }

  const addCert = () => {
    if (newCert.trim()) {
      setCertifications((prev) => [...prev, newCert.trim()])
      setNewCert('')
    }
  }

  const handleSave = async () => {
    if (!user || !profileId) return
    setLoading(true)
    try {
      const [userRes, profileRes] = await Promise.all([
        fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        }),
        fetch(`/api/therapists/${profileId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bio, price: parseFloat(price), modality,
            location, city, state,
            yearsExp: yearsExp ? parseInt(yearsExp) : undefined,
            therapies: selectedTherapies,
            certifications,
          }),
        }),
      ])

      const [userData, profileData] = await Promise.all([userRes.json(), profileRes.json()])

      if (userData.success && profileData.success) {
        toast.success('Perfil atualizado com sucesso!')
      } else {
        toast.error(userData.error || profileData.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header title="Meu Perfil" description="Mantenha seus dados atualizados para atrair mais pacientes" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Dados pessoais */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Dados pessoais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Telefone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 9xxxx-xxxx" />
          </div>
        </div>

        {/* Perfil profissional */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2">Perfil profissional</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição profissional</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Descreva sua experiência, abordagem e diferenciais..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Preço por sessão (R$)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input label="Anos de experiência" type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Modalidade</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ONLINE">Online</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="AMBOS">Online e Presencial</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Endereço / Bairro" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Estado (UF)" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
          </div>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {THERAPY_OPTIONS.map((therapy) => (
              <button
                key={therapy}
                onClick={() => toggleTherapy(therapy)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedTherapies.includes(therapy)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-surface-200 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {therapy}
              </button>
            ))}
          </div>
          {selectedTherapies.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">{selectedTherapies.length} especialidade(s) selecionada(s)</p>
          )}
        </div>

        {/* Certificações */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Certificações e formações</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCert()}
              placeholder="Ex: Reiki Mestre, CRP-06/12345..."
              className="flex-1 px-4 py-2 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button size="sm" variant="secondary" onClick={addCert}>
              <Plus size={16} />
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-sm">
                {cert}
                <button
                  onClick={() => setCertifications((prev) => prev.filter((_, j) => j !== i))}
                  className="hover:text-primary-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {certifications.length === 0 && (
              <p className="text-sm text-slate-400">Nenhuma certificação adicionada</p>
            )}
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
