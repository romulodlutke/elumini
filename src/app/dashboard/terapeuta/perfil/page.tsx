'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { X, Plus, Save, Upload, FileText, ExternalLink, Trash2, Briefcase, Pencil, User, Camera, Phone, DollarSign, CreditCard } from 'lucide-react'
import { THERAPY_OPTIONS } from '@/constants/therapies'

interface TherapistService {
  id: string
  name: string
  description: string | null
  problemsHelped: string | null
  durationMinutes: number
  price: number
  promoPrice: number | null
  currency: string
  modality: string
}

export default function TerapeutaPerfilPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [professionalName, setProfessionalName] = useState('')
  const [country, setCountry] = useState('')
  const [nationality, setNationality] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [languages, setLanguages] = useState('')
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('')
  const [modality, setModality] = useState('AMBOS')
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [professionalEmail, setProfessionalEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [minSessionPrice, setMinSessionPrice] = useState('')
  const [maxSessionPrice, setMaxSessionPrice] = useState('')
  const [baseCurrency, setBaseCurrency] = useState('BRL')
  const [allowPromos, setAllowPromos] = useState(false)
  const [minPromoPrice, setMinPromoPrice] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [newCert, setNewCert] = useState('')
  const [publicTargetDescription, setPublicTargetDescription] = useState('')
  const [sessionsPerMonthGoal, setSessionsPerMonthGoal] = useState('') // 10, 20, 40 ou 80
  const [wantCampaigns, setWantCampaigns] = useState(false)
  const [allowAutoScheduling, setAllowAutoScheduling] = useState(false)
  const [certificateFiles, setCertificateFiles] = useState<{ id: string; name: string; fileUrl: string }[]>([])
  const [certificateUploading, setCertificateUploading] = useState(false)

  // Métodos de pagamento e dados para recebimento
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [accountHolderName, setAccountHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [pixKey, setPixKey] = useState('')

  // Serviços
  const [services, setServices] = useState<TherapistService[]>([])
  const [serviceForm, setServiceForm] = useState<{
    id: string | null
    name: string
    description: string
    problemsHelped: string
    durationMinutes: string
    price: string
    promoPrice: string
    currency: string
    modality: string
  }>({
    id: null,
    name: '',
    description: '',
    problemsHelped: '',
    durationMinutes: '60',
    price: '',
    promoPrice: '',
    currency: 'BRL',
    modality: 'AMBOS',
  })
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [savingService, setSavingService] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(`/api/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setName(data.data.name || '')
          setPhone(data.data.phone || '')
          setBirthDate(data.data.birthDate ? data.data.birthDate.slice(0, 10) : '')
          setAvatarUrl(data.data.avatarUrl || null)
          const tp = data.data.therapistProfile
          if (tp) {
            setProfileId(tp.id)
            setProfessionalName(tp.professionalName || '')
            setCountry(tp.country || '')
            setNationality(tp.nationality || '')
            setDocumentId(tp.documentId || '')
            setLanguages(tp.languages?.length ? tp.languages.join(', ') : 'Português')
            setBio(tp.bio || '')
            setPrice(String(tp.price || ''))
            setModality(tp.modality || 'AMBOS')
            setLocation(tp.location || '')
            setCity(tp.city || '')
            setState(tp.state || '')
            setYearsExp(String(tp.yearsExp || ''))
            setSelectedTherapies(tp.therapies || [])
            setCertifications(tp.certifications || [])
            setPublicTargetDescription(tp.targetAudience?.specialNeeds ?? '')
            setSessionsPerMonthGoal(tp.sessionsPerMonthGoal != null ? String(tp.sessionsPerMonthGoal) : '')
            setWantCampaigns(tp.wantCampaigns ?? false)
            setAllowAutoScheduling(tp.allowAutoScheduling ?? false)
            setWhatsapp(tp.whatsapp || '')
            setProfessionalEmail(tp.professionalEmail || '')
            setInstagram(tp.instagram || '')
            setFacebook(tp.facebook || '')
            setWebsiteUrl(tp.websiteUrl || '')
            setMinSessionPrice(tp.minSessionPrice != null ? String(tp.minSessionPrice) : '')
            setMaxSessionPrice(tp.maxSessionPrice != null ? String(tp.maxSessionPrice) : '')
            setBaseCurrency(tp.baseCurrency || 'BRL')
            setAllowPromos(tp.allowPromos ?? false)
            setMinPromoPrice(tp.minPromoPrice != null ? String(tp.minPromoPrice) : '')
          }
        }
      })
  }, [user])

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/certificates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCertificateFiles(data.data || [])
      })
      .catch(() => setCertificateFiles([]))
  }, [profileId])

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/services`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setServices(data.data || [])
      })
      .catch(() => setServices([]))
  }, [profileId])

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/payment`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setPaymentMethods(data.data.paymentMethods || [])
          const d = data.data.paymentDetails
          setAccountHolderName(d?.accountHolderName ?? '')
          setBankName(d?.bankName ?? '')
          setAccountNumber(d?.accountNumber ?? '')
          setPixKey(d?.pixKey ?? '')
        }
      })
      .catch(() => {})
  }, [profileId])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/users/${user.id}/avatar`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.data?.avatarUrl) {
        setAvatarUrl(data.data.avatarUrl)
        toast.success('Foto profissional atualizada!')
      } else {
        toast.error(data.error || 'Falha no envio')
      }
    } catch {
      toast.error('Erro ao enviar foto')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profileId) return
    setCertificateUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      const res = await fetch(`/api/therapists/${profileId}/certificates`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.data) {
        setCertificateFiles((prev) => [...prev, data.data])
        toast.success('Certificado enviado!')
      } else {
        toast.error(data.error || 'Falha no envio')
      }
    } catch {
      toast.error('Erro ao enviar certificado')
    } finally {
      setCertificateUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveCertificate = async (certId: string) => {
    if (!profileId) return
    try {
      const res = await fetch(`/api/therapists/${profileId}/certificates/${certId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCertificateFiles((prev) => prev.filter((c) => c.id !== certId))
        toast.success('Certificado removido')
      } else {
        toast.error(data.error || 'Erro ao remover')
      }
    } catch {
      toast.error('Erro ao remover certificado')
    }
  }

  const PAYMENT_METHOD_OPTIONS = [
    { value: 'TRANSFERENCIA', label: 'Transferência bancária' },
    { value: 'CREDITO', label: 'Cartão de crédito' },
    { value: 'DEBITO', label: 'Cartão de débito' },
    { value: 'PAYPAL', label: 'PayPal' },
    { value: 'PIX', label: 'Pix' },
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
    { value: 'PREX', label: 'Prex' },
    { value: 'CRIPTOMOEDA', label: 'Criptomoeda' },
    { value: 'DINHEIRO', label: 'Dinheiro' },
  ]

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    )
  }

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

  const openServiceForm = (service?: TherapistService) => {
    if (service) {
      setServiceForm({
        id: service.id,
        name: service.name,
        description: service.description || '',
        problemsHelped: service.problemsHelped || '',
        durationMinutes: String(service.durationMinutes),
        price: String(service.price),
        promoPrice: service.promoPrice != null ? String(service.promoPrice) : '',
        currency: service.currency,
        modality: service.modality,
      })
    } else {
      setServiceForm({
        id: null,
        name: '',
        description: '',
        problemsHelped: '',
        durationMinutes: '60',
        price: '',
        promoPrice: '',
        currency: 'BRL',
        modality: 'AMBOS',
      })
    }
    setShowServiceForm(true)
  }

  const closeServiceForm = () => {
    setShowServiceForm(false)
    setServiceForm({ id: null, name: '', description: '', problemsHelped: '', durationMinutes: '60', price: '', promoPrice: '', currency: 'BRL', modality: 'AMBOS' })
  }

  const handleSaveService = async () => {
    if (!profileId) return
    if (!serviceForm.name.trim()) {
      toast.error('Nome do serviço é obrigatório')
      return
    }
    const priceNum = parseFloat(serviceForm.price)
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error('Preço inválido')
      return
    }
    const duration = parseInt(serviceForm.durationMinutes, 10)
    if (isNaN(duration) || duration < 15 || duration > 480) {
      toast.error('Duração deve ser entre 15 e 480 minutos')
      return
    }

    setSavingService(true)
    try {
      const url = serviceForm.id
        ? `/api/therapists/${profileId}/services/${serviceForm.id}`
        : `/api/therapists/${profileId}/services`
      const method = serviceForm.id ? 'PATCH' : 'POST'
      const promoNum = serviceForm.promoPrice.trim() ? parseFloat(serviceForm.promoPrice) : null
      const body = serviceForm.id
        ? { name: serviceForm.name, description: serviceForm.description || null, problemsHelped: serviceForm.problemsHelped || null, durationMinutes: duration, price: priceNum, promoPrice: promoNum != null && !isNaN(promoNum) && promoNum > 0 ? promoNum : null, currency: serviceForm.currency, modality: serviceForm.modality }
        : { name: serviceForm.name, description: serviceForm.description || null, problemsHelped: serviceForm.problemsHelped || null, durationMinutes: duration, price: priceNum, promoPrice: promoNum != null && !isNaN(promoNum) && promoNum > 0 ? promoNum : null, currency: serviceForm.currency, modality: serviceForm.modality }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(serviceForm.id ? 'Serviço atualizado!' : 'Serviço adicionado!')
        const svc = data.data
        setServices((prev) =>
          serviceForm.id
            ? prev.map((s) => (s.id === serviceForm.id ? { ...s, ...svc } : s))
            : [...prev, { id: svc.id, name: svc.name, description: svc.description ?? null, problemsHelped: svc.problemsHelped ?? null, durationMinutes: svc.durationMinutes, price: svc.price, promoPrice: svc.promoPrice ?? null, currency: svc.currency, modality: svc.modality }]
        )
        closeServiceForm()
      } else {
        toast.error(data.error || 'Erro ao salvar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSavingService(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!profileId || !confirm('Remover este serviço?')) return
    try {
      const res = await fetch(`/api/therapists/${profileId}/services/${serviceId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setServices((prev) => prev.filter((s) => s.id !== serviceId))
        toast.success('Serviço removido')
      } else {
        toast.error(data.error || 'Erro ao remover')
      }
    } catch {
      toast.error('Erro ao remover')
    }
  }

  const handleSave = async () => {
    if (!user || !profileId) return
    setLoading(true)
    try {
      const [userRes, profileRes, paymentRes] = await Promise.all([
        fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, birthDate: birthDate || undefined }),
        }),
        fetch(`/api/therapists/${profileId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bio, price: parseFloat(price), modality,
            location, city, state, country: country || null,
            professionalName: professionalName || null, nationality: nationality || null,
            documentId: documentId || null,
            languages: languages ? languages.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
            yearsExp: yearsExp ? parseInt(yearsExp) : undefined,
            therapies: selectedTherapies,
            certifications,
            sessionsPerMonthGoal: sessionsPerMonthGoal ? parseInt(sessionsPerMonthGoal, 10) : null,
            wantCampaigns,
            allowAutoScheduling,
            publicTargetDescription: publicTargetDescription || null,
            whatsapp: whatsapp || null,
            professionalEmail: professionalEmail || null,
            instagram: instagram || null,
            facebook: facebook || null,
            websiteUrl: websiteUrl || null,
            minSessionPrice: minSessionPrice ? parseFloat(minSessionPrice) : null,
            maxSessionPrice: maxSessionPrice ? parseFloat(maxSessionPrice) : null,
            baseCurrency: baseCurrency || null,
            allowPromos,
            minPromoPrice: minPromoPrice ? parseFloat(minPromoPrice) : null,
          }),
        }),
        fetch(`/api/therapists/${profileId}/payment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethods,
            accountHolderName: accountHolderName || null,
            bankName: bankName || null,
            accountNumber: accountNumber || null,
            pixKey: pixKey || null,
          }),
        }),
      ])

      const [userData, profileData, paymentData] = await Promise.all([
        userRes.json(),
        profileRes.json(),
        paymentRes.json(),
      ])

      if (userData.success && profileData.success && paymentData.success) {
        toast.success('Perfil atualizado com sucesso!')
      } else {
        toast.error(userData.error || profileData.error || paymentData.error || 'Erro ao salvar')
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
        {/* Dados pessoais básicos (Ficha profissional) */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <User size={20} className="text-primary-600" />
            Dados pessoais básicos
          </h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Foto profissional" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
              </div>
              <label className="cursor-pointer flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                <Camera size={16} />
                {avatarUploading ? 'Enviando...' : 'Foto profissional (fundo neutro)'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Nome profissional (como deseja aparecer)" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} placeholder="Ex.: Dra. Ana Silva" />
              <Input label="Data de nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <Input label="País" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex.: Brasil" />
              <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Estado (UF)" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
              <Input label="Nacionalidade" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ex.: Brasileira" />
              <Input label="Idioma(s) que fala" value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Ex.: Português, Inglês" />
              <Input label="Documento de identidade / Passaporte" value={documentId} onChange={(e) => setDocumentId(e.target.value)} placeholder="Número do documento" />
            </div>
          </div>
        </div>

        {/* Dados de contato */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Phone size={20} className="text-primary-600" />
            Dados de contato
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Telefone com código do país" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 9xxxx-xxxx" />
            <Input label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+55 11 9xxxx-xxxx" />
            <Input label="Email profissional" type="email" value={professionalEmail} onChange={(e) => setProfessionalEmail(e.target.value)} placeholder="contato@seusite.com" />
            <Input label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuusuario" />
            <Input label="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="URL ou nome do perfil" />
            <Input label="Site (se tiver)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Input label="Endereço físico de atendimento (se atende presencialmente)" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rua, número, bairro" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Modalidade de atendimento</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'ONLINE', label: 'Online' },
                { value: 'PRESENCIAL', label: 'Presencial' },
                { value: 'AMBOS', label: 'Ambos' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modality"
                    value={opt.value}
                    checked={modality === opt.value}
                    onChange={() => setModality(opt.value)}
                    className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Preço oficial da sessão base */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <DollarSign size={20} className="text-primary-600" />
            Preço oficial da sessão base
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Preço mínimo da sessão"
              type="number"
              min={0}
              step="0.01"
              value={minSessionPrice}
              onChange={(e) => setMinSessionPrice(e.target.value)}
              placeholder="Ex.: 100"
            />
            <Input
              label="Preço máximo da sessão"
              type="number"
              min={0}
              step="0.01"
              value={maxSessionPrice}
              onChange={(e) => setMaxSessionPrice(e.target.value)}
              placeholder="Ex.: 300"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Moeda</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="BRL">BRL (Real)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Autoriza promoções</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="allowPromos"
                  checked={allowPromos === true}
                  onChange={() => setAllowPromos(true)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="allowPromos"
                  checked={allowPromos === false}
                  onChange={() => setAllowPromos(false)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Não</span>
              </label>
            </div>
          </div>
          {allowPromos && (
            <div className="max-w-xs">
              <Input
                label="Preço mínimo permitido em promoções"
                type="number"
                min={0}
                step="0.01"
                value={minPromoPrice}
                onChange={(e) => setMinPromoPrice(e.target.value)}
                placeholder="Ex.: 80"
              />
            </div>
          )}
        </div>

        {/* Métodos de pagamento aceitos e dados para recebimento */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <CreditCard size={20} className="text-primary-600" />
            Métodos de pagamento aceitos
          </h2>
          <div className="flex flex-wrap gap-3">
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentMethods.includes(opt.value)}
                  onChange={() => togglePaymentMethod(opt.value)}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 border-t border-surface-200">
            <h3 className="font-medium text-slate-800 mb-3">Dados para recebimento</h3>
            <p className="text-sm text-slate-500 mb-4">
              Preencha os dados que forem aplicáveis aos métodos que você aceita (ex.: titular e banco para transferência, chave Pix para Pix).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Nome do titular"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Nome como está no banco"
              />
              <Input
                label="Banco"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex.: Banco do Brasil, Nubank"
              />
              <Input
                label="Número da conta"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Agência e conta ou só conta"
              />
              <Input
                label="Chave Pix / Alias"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </div>
          </div>
        </div>

        {/* Perfil profissional */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2">Perfil profissional</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição profissional (biografia)</label>
            <p className="text-xs text-slate-500 mb-2">
              Guia: quem você é, o que faz, quem ajuda e qual é o seu enfoque. Texto de apresentação entre 100 e 300 palavras.
            </p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={6}
              placeholder="Descreva sua experiência, abordagem e diferenciais..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <p className={`mt-1 text-xs ${bio.trim().split(/\s+/).filter(Boolean).length < 100 || bio.trim().split(/\s+/).filter(Boolean).length > 300 ? 'text-amber-600' : 'text-slate-500'}`}>
              {bio.trim() ? `${bio.trim().split(/\s+/).filter(Boolean).length} palavras` : '0 palavras'} (mín. 100, máx. 300)
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Preço por sessão (R$)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input label="Anos de experiência" type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Estado (UF)" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
          </div>
        </div>

        {/* Público alvo */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2">Público alvo e metas</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Qual seu público alvo?</label>
            <textarea
              value={publicTargetDescription}
              onChange={(e) => setPublicTargetDescription(e.target.value)}
              rows={3}
              placeholder="Ex.: Adultos com ansiedade, idosos, gestantes, pessoas em processo de luto..."
              className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Objetivos dentro da plataforma */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 mb-2">Objetivos dentro da plataforma</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade de sessões desejadas por mês</label>
            <div className="flex flex-wrap gap-3">
              {[10, 20, 40, 80].map((n) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sessionsPerMonthGoal"
                    checked={sessionsPerMonthGoal === String(n)}
                    onChange={() => setSessionsPerMonthGoal(String(n))}
                    className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">{n}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Deseja aparecer em campanhas publicitárias?</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wantCampaigns"
                  checked={wantCampaigns === true}
                  onChange={() => setWantCampaigns(true)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wantCampaigns"
                  checked={wantCampaigns === false}
                  onChange={() => setWantCampaigns(false)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Não</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Autoriza que o sistema agende automaticamente?</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="allowAutoScheduling"
                  checked={allowAutoScheduling === true}
                  onChange={() => setAllowAutoScheduling(true)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Sim</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="allowAutoScheduling"
                  checked={allowAutoScheduling === false}
                  onChange={() => setAllowAutoScheduling(false)}
                  className="rounded-full border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Não</span>
              </label>
            </div>
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

        {/* Serviços que ofereço */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Briefcase size={20} className="text-primary-600" />
            Serviços que ofereço
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Cadastre os serviços que você oferece. O paciente escolherá um ao agendar e verá duração, preço, formato e descrição.
          </p>
          <Button size="sm" variant="secondary" onClick={() => openServiceForm()} className="mb-4">
            <Plus size={16} />
            Adicionar serviço
          </Button>

          {showServiceForm && (
            <div className="mb-6 p-4 rounded-xl border border-primary-200 bg-primary-50/50 space-y-4">
              <h3 className="font-medium text-slate-800">{serviceForm.id ? 'Editar serviço' : 'Novo serviço'}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Nome do serviço"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Sessão de Reiki"
                />
                <Input
                  label="Duração (minutos)"
                  type="number"
                  min={15}
                  max={480}
                  value={serviceForm.durationMinutes}
                  onChange={(e) => setServiceForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  placeholder="60"
                />
                <Input
                  label="Preço"
                  type="number"
                  min={0}
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="150.00"
                />
                <Input
                  label="Preço promocional (opcional)"
                  type="number"
                  min={0}
                  step="0.01"
                  value={serviceForm.promoPrice}
                  onChange={(e) => setServiceForm((f) => ({ ...f, promoPrice: e.target.value }))}
                  placeholder="Ex.: 120.00"
                />
                {!allowPromos && serviceForm.promoPrice && (
                  <p className="text-xs text-amber-600 col-span-2">
                    Ative &quot;Autoriza promoções&quot; em Preço oficial da sessão base para usar preço promocional.
                  </p>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Moeda</label>
                  <select
                    value={serviceForm.currency}
                    onChange={(e) => setServiceForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Formato</label>
                  <select
                    value={serviceForm.modality}
                    onChange={(e) => setServiceForm((f) => ({ ...f, modality: e.target.value }))}
                    className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="AMBOS">Online e Presencial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descrição breve do serviço (opcional)</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Descreva o que inclui este serviço..."
                  className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Problemas que ajuda a resolver (opcional)</label>
                <textarea
                  value={serviceForm.problemsHelped}
                  onChange={(e) => setServiceForm((f) => ({ ...f, problemsHelped: e.target.value }))}
                  rows={2}
                  placeholder="Ex.: ansiedade, bloqueios emocionais, abundância, saúde..."
                  className="w-full px-4 py-3 text-sm border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={savingService} onClick={handleSaveService}>
                  {serviceForm.id ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button size="sm" variant="outline" onClick={closeServiceForm}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-start justify-between gap-3 p-4 rounded-xl border border-surface-200 bg-surface-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800">{svc.name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {svc.durationMinutes} min • {svc.modality === 'ONLINE' ? 'Online' : svc.modality === 'PRESENCIAL' ? 'Presencial' : 'Online e Presencial'} • {svc.currency === 'BRL' ? 'R$' : svc.currency} {Number(svc.price).toFixed(2)}
                    {svc.promoPrice != null && Number(svc.promoPrice) > 0 && (
                      <span className="text-primary-600 font-medium ml-1"> • Promo: {svc.currency === 'BRL' ? 'R$' : svc.currency} {Number(svc.promoPrice).toFixed(2)}</span>
                    )}
                  </p>
                  {svc.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => openServiceForm(svc)}
                    className="p-2 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteService(svc.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {services.length === 0 && !showServiceForm && (
              <p className="text-sm text-slate-400">Nenhum serviço cadastrado. Adicione os serviços que você oferece.</p>
            )}
          </div>
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

        {/* Certificados (arquivos) — visíveis no perfil público */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6">
          <h2 className="font-semibold text-slate-900 mb-2">Certificados em PDF ou imagem</h2>
          <p className="text-sm text-slate-500 mb-4">
            Envie diplomas, certificados ou comprovantes de formação. Os pacientes poderão visualizá-los no seu perfil.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={certificateUploading || !profileId}
                onChange={handleCertificateUpload}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 bg-surface-50 text-sm font-medium text-slate-700 hover:bg-surface-100 transition-colors">
                <Upload size={16} />
                {certificateUploading ? 'Enviando...' : 'Enviar certificado (PDF ou imagem)'}
              </span>
            </label>
          </div>
          <div className="space-y-2">
            {certificateFiles.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl border border-surface-200 bg-surface-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={18} className="text-slate-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-800 truncate">{cert.name}</span>
                  <a
                    href={cert.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary-600 hover:underline text-xs flex items-center gap-1"
                  >
                    Ver <ExternalLink size={12} />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCertificate(cert.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {certificateFiles.length === 0 && (
              <p className="text-sm text-slate-400">Nenhum arquivo enviado. Use o botão acima para adicionar.</p>
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
