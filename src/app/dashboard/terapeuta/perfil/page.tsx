'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'
import { withAuth } from '@/lib/auth-fetch'
import { useTherapistUnifiedUpload } from '@/hooks/useTherapistUnifiedUpload'
import { X, Plus, Save, Upload, FileText, ExternalLink, Trash2, Briefcase, Pencil, User, Camera, Phone, DollarSign, CreditCard, Eye, Download, CheckCircle2, Clock } from 'lucide-react'
import { THERAPY_OPTIONS } from '@/constants/therapies'
import { normalizeLanguagesFromServer } from '@/constants/languages'
import { LanguageMultiSelect } from '@/components/therapist/LanguageMultiSelect'

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

/** Dados mínimos do usuário após GET /api/users/:id (upload só após carregar). */
interface LoadedTherapistProfile {
  id: string
  therapistProfileId: string | null
}

export default function TerapeutaPerfilPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<LoadedTherapistProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [professionalName, setProfessionalName] = useState('')
  const [country, setCountry] = useState('')
  const [nationality, setNationality] = useState('')
  const [documentId, setDocumentId] = useState('')
  const [languages, setLanguages] = useState<string[]>(['Português'])
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
  const [documentUploadLabel, setDocumentUploadLabel] = useState<string | null>(null)
  const [documentFileName, setDocumentFileName] = useState<string | null>(null)
  const [documentExists, setDocumentExists] = useState(false)
  const [documentLoading, setDocumentLoading] = useState(false)

  const profileLoaded = !loadingProfile && !!profile

  const { fileInputRef, pickFile, handleFileChange, defaultAccept, isUploading } = useTherapistUnifiedUpload({
    userId: user?.id,
    profileId,
    profileLoaded,
    onProfileImageSuccess: (url) => {
      setAvatarUrl(url)
      toast.success('Foto profissional atualizada!')
    },
    onCertificationSuccess: (row) => {
      setCertificateFiles((prev) => [...prev, row])
      toast.success('Certificado enviado!')
    },
    onDocumentSuccess: (fileName) => {
      setDocumentUploadLabel(fileName)
      setDocumentFileName(fileName)
      setDocumentExists(true)
      toast.success('Documento enviado com sucesso!')
    },
    onError: (msg) => toast.error(msg),
  })

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

  /** Refetch user + therapist profile from API and sync form state (also used after save). */
  const loadProfile = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false
    if (!user) {
      setProfile(null)
      setProfileId(null)
      setProfileLoadError(null)
      setLoadingProfile(false)
      return
    }
    if (!silent) {
      setLoadingProfile(true)
      setProfileLoadError(null)
    }
    try {
      const r = await fetch('/api/profile', withAuth({ cache: 'no-store' }))
      let data: { success?: boolean; error?: string; data?: Record<string, unknown> }
      try {
        data = await r.json()
      } catch {
        data = { success: false, error: 'Resposta inválida do servidor' }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[TerapeutaPerfil] GET /api/profile', { status: r.status, ok: r.ok })
        console.log('Perfil carregado:', data)
      }

      if (!r.ok || !data.success || !data.data) {
        const msg = [data.error, !r.ok && `HTTP ${r.status}`].filter(Boolean).join(' · ') || 'Falha ao carregar perfil'
        console.error('Erro ao carregar perfil:', { status: r.status, body: data })
        setProfileLoadError(msg)
        toast.error(data.error || 'Não foi possível carregar o perfil')
        setProfile(null)
        setProfileId(null)
        return
      }

      const row = data.data as {
        id: string
        role?: string
        name?: string
        therapistProfile?: Record<string, unknown> | null
      }

      if (row.role !== 'TERAPEUTA') {
        const msg = 'Esta área é exclusiva para terapeutas.'
        setProfileLoadError(msg)
        toast.error(msg)
        setProfile(null)
        setProfileId(null)
        return
      }

      const tp = row.therapistProfile as typeof row.therapistProfile & {
        id?: string
        professionalName?: string | null
        country?: string | null
        nationality?: string | null
        documentId?: string | null
        languages?: string[]
        bio?: string | null
        price?: unknown
        modality?: string
        location?: string | null
        city?: string | null
        state?: string | null
        yearsExp?: number | null
        therapies?: string[]
        certifications?: string[]
        targetAudience?: { specialNeeds?: string | null } | null
        sessionsPerMonthGoal?: number | null
        wantCampaigns?: boolean
        allowAutoScheduling?: boolean
        whatsapp?: string | null
        professionalEmail?: string | null
        instagram?: string | null
        facebook?: string | null
        websiteUrl?: string | null
        minSessionPrice?: unknown
        maxSessionPrice?: unknown
        baseCurrency?: string | null
        allowPromos?: boolean
        minPromoPrice?: unknown
        documentUrl?: string | null
        documentFileName?: string | null
      } | null

      const snapshot: LoadedTherapistProfile = {
        id: row.id,
        therapistProfileId: tp?.id ?? null,
      }
      setProfile(snapshot)
      setProfileLoadError(null)
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile (snapshot):', snapshot)
      }

      setName(row.name || '')
      setPhone((row as { phone?: string | null }).phone || '')
      setBirthDate(
        (row as { birthDate?: string | null }).birthDate
          ? String((row as { birthDate?: string }).birthDate).slice(0, 10)
          : ''
      )
      setAvatarUrl((row as { avatarUrl?: string | null }).avatarUrl || null)
      if (tp) {
        setProfileId(tp.id ?? null)
        setProfessionalName(tp.professionalName || '')
        setCountry(tp.country || '')
        setNationality(tp.nationality || '')
        setDocumentId(tp.documentId || '')
        setLanguages(normalizeLanguagesFromServer(tp.languages))
        setBio(tp.bio || '')
        setPrice(String(tp.price ?? ''))
        setModality(tp.modality || 'AMBOS')
        setLocation(tp.location || '')
        setCity(tp.city || '')
        setState(tp.state || '')
        setYearsExp(tp.yearsExp != null ? String(tp.yearsExp) : '')
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
        // Estado do documento de identidade
        const hasDoc = !!tp.documentUrl
        setDocumentExists(hasDoc)
        setDocumentFileName(tp.documentFileName || null)
        if (hasDoc && tp.documentFileName) {
          setDocumentUploadLabel(tp.documentFileName)
        }
      } else {
        setProfileId(null)
        setDocumentExists(false)
        setDocumentFileName(null)
      }
    } catch (e) {
      console.error('Erro ao carregar perfil:', e)
      setProfileLoadError('Erro de rede ou servidor. Verifique sua conexão e tente novamente.')
      toast.error('Erro ao carregar perfil')
      setProfile(null)
      setProfileId(null)
    } finally {
      if (!silent) setLoadingProfile(false)
    }
  }, [user])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  /** Obtém URL assinada e abre/baixa o documento */
  const openDocument = async (mode: 'view' | 'download') => {
    setDocumentLoading(true)
    try {
      const res = await fetch('/api/documents/access', withAuth())
      const data = await res.json()
      if (!data.success || !data.data?.signedUrl) {
        toast.error(data.error || 'Não foi possível acessar o documento')
        return
      }
      if (mode === 'view') {
        window.open(data.data.signedUrl, '_blank', 'noopener,noreferrer')
      } else {
        const a = document.createElement('a')
        a.href = data.data.signedUrl
        a.download = data.data.fileName || 'documento'
        a.click()
      }
    } catch {
      toast.error('Erro ao acessar o documento')
    } finally {
      setDocumentLoading(false)
    }
  }

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/certificates`, withAuth())
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCertificateFiles(data.data || [])
      })
      .catch(() => setCertificateFiles([]))
  }, [profileId])

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/services`, withAuth())
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setServices(data.data || [])
      })
      .catch(() => setServices([]))
  }, [profileId])

  useEffect(() => {
    if (!profileId) return
    fetch(`/api/therapists/${profileId}/payment`, withAuth())
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

  const handleRemoveCertificate = async (certId: string) => {
    if (!profileId) return
    try {
      const res = await fetch(`/api/therapists/${profileId}/certificates/${certId}`, withAuth({ method: 'DELETE' }))
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
    if (!profileId) {
      toast.error('Perfil ainda não carregado. Aguarde ou recarregue a página.')
      return
    }
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

      if (process.env.NODE_ENV === 'development') {
        console.log('[TerapeutaPerfil] service save', { method, url })
      }
      const res = await fetch(
        url,
        withAuth({
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      )
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
      const res = await fetch(`/api/therapists/${profileId}/services/${serviceId}`, withAuth({ method: 'DELETE' }))
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
    if (!user) {
      toast.error('Sessão inválida. Faça login novamente.')
      return
    }
    if (!profileId) {
      toast.error('Perfil de terapeuta não encontrado. Recarregue a página ou contate o suporte.')
      return
    }
    setLoading(true)
    try {
      const priceNum = parseFloat(price)
      const yearsNum = yearsExp.trim() === '' ? null : parseInt(yearsExp, 10)
      const sessionsGoal =
        sessionsPerMonthGoal.trim() === '' ? null : parseInt(sessionsPerMonthGoal, 10)
      const minS = minSessionPrice.trim() === '' ? null : parseFloat(minSessionPrice)
      const maxS = maxSessionPrice.trim() === '' ? null : parseFloat(maxSessionPrice)
      const minPromo = minPromoPrice.trim() === '' ? null : parseFloat(minPromoPrice)

      const profileBody: Record<string, unknown> = {
        bio,
        modality,
        location,
        city,
        state,
        country: country || null,
        professionalName: professionalName || null,
        nationality: nationality || null,
        documentId: documentId || null,
        languages: languages.length ? languages : ['Português'],
        therapies: selectedTherapies,
        certifications,
        wantCampaigns,
        allowAutoScheduling,
        publicTargetDescription: publicTargetDescription || null,
        whatsapp: whatsapp || null,
        professionalEmail: professionalEmail || null,
        instagram: instagram || null,
        facebook: facebook || null,
        websiteUrl: websiteUrl || null,
        baseCurrency: baseCurrency || null,
        allowPromos,
      }
      if (Number.isFinite(priceNum) && priceNum >= 0) profileBody.price = priceNum
      if (yearsNum !== null && Number.isFinite(yearsNum) && yearsNum >= 0) profileBody.yearsExp = yearsNum
      else if (yearsExp.trim() === '') profileBody.yearsExp = null
      if (sessionsGoal !== null && Number.isFinite(sessionsGoal) && sessionsGoal >= 0) {
        profileBody.sessionsPerMonthGoal = sessionsGoal
      } else if (sessionsPerMonthGoal.trim() === '') {
        profileBody.sessionsPerMonthGoal = null
      }
      if (minS !== null && Number.isFinite(minS) && minS >= 0) profileBody.minSessionPrice = minS
      else if (minSessionPrice.trim() === '') profileBody.minSessionPrice = null
      if (maxS !== null && Number.isFinite(maxS) && maxS >= 0) profileBody.maxSessionPrice = maxS
      else if (maxSessionPrice.trim() === '') profileBody.maxSessionPrice = null
      if (minPromo !== null && Number.isFinite(minPromo) && minPromo >= 0) profileBody.minPromoPrice = minPromo
      else if (minPromoPrice.trim() === '') profileBody.minPromoPrice = null

      if (process.env.NODE_ENV === 'development') {
        console.log('[TerapeutaPerfil] save', { profileId, profileKeys: Object.keys(profileBody) })
      }

      const [userRes, profileRes, paymentRes] = await Promise.all([
        fetch(
          `/api/users/${user.id}`,
          withAuth({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, birthDate: birthDate || undefined }),
          })
        ),
        fetch(
          `/api/therapists/${profileId}`,
          withAuth({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileBody),
          })
        ),
        fetch(
          `/api/therapists/${profileId}/payment`,
          withAuth({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentMethods,
              accountHolderName: accountHolderName || null,
              bankName: bankName || null,
              accountNumber: accountNumber || null,
              pixKey: pixKey || null,
            }),
          })
        ),
      ])

      const [userData, profileData, paymentData] = await Promise.all([
        userRes.json().catch(() => ({})),
        profileRes.json().catch(() => ({})),
        paymentRes.json().catch(() => ({})),
      ])

      if (userData.success && profileData.success && paymentData.success) {
        toast.success('Perfil atualizado com sucesso!')
        await loadProfile({ silent: true })
      } else {
        const parts = [
          !userData.success && userData.error,
          !profileData.success && profileData.error,
          !paymentData.success && paymentData.error,
        ].filter(Boolean)
        if (process.env.NODE_ENV === 'development') {
          console.warn('[TerapeutaPerfil] save partial failure', { userData, profileData, paymentData })
        }
        toast.error(parts.join(' · ') || 'Erro ao salvar')
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TerapeutaPerfil] save', e)
      }
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div>
        <Header title="Meu Perfil" description="Mantenha seus dados atualizados para atrair mais pacientes" />
        <div className="p-6 max-w-3xl">
          <p className="text-slate-600 text-sm">Faça login para acessar o perfil.</p>
        </div>
      </div>
    )
  }

  if (loadingProfile) {
    return (
      <div>
        <Header title="Meu Perfil" description="Mantenha seus dados atualizados para atrair mais pacientes" />
        <div className="p-6 max-w-3xl flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="h-10 w-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile && !loadingProfile) {
    return (
      <div>
        <Header title="Meu Perfil" description="Mantenha seus dados atualizados para atrair mais pacientes" />
        <div className="p-6 max-w-3xl space-y-4 text-center">
          <p className="text-slate-800 font-medium">Não foi possível carregar seus dados.</p>
          {profileLoadError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 border border-red-100">{profileLoadError}</p>
          )}
          <p className="text-sm text-slate-500">
            Confira no DevTools → Network se <code className="text-xs bg-slate-100 px-1 rounded">GET /api/profile</code> retorna
            200. Se aparecer 401, faça login novamente.
          </p>
          <Button type="button" onClick={() => loadProfile()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  const uploadBusy = loadingProfile || isUploading
  const canCertOrDocUpload = !!profileId

  return (
    <div>
      <Header title="Meu Perfil" description="Mantenha seus dados atualizados para atrair mais pacientes" />
      <input
        ref={fileInputRef}
        type="file"
        tabIndex={-1}
        accept={defaultAccept}
        onChange={handleFileChange}
        disabled={uploadBusy}
        data-testid="therapist-unified-upload"
        aria-hidden
        className="pointer-events-none fixed left-4 top-20 z-[60] m-0 h-px w-px min-h-px min-w-px overflow-hidden border-0 p-0 opacity-[0.02]"
      />
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
              <button
                type="button"
                className="cursor-pointer flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => pickFile('profileImage')}
                disabled={uploadBusy}
              >
                <Camera size={16} />
                {isUploading ? 'Enviando...' : 'Enviar imagem — foto profissional (fundo neutro)'}
              </button>
            </div>
            <div className="flex-1 grid sm:grid-cols-2 gap-4">
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Nome profissional (como deseja aparecer)" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} placeholder="Ex.: Dra. Ana Silva" />
              <Input label="Data de nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <Input label="País" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex.: Brasil" />
              <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Estado (UF)" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
              <Input label="Nacionalidade" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ex.: Brasileira" />
              <div className="sm:col-span-2">
                <LanguageMultiSelect
                  label="Idioma(s) que fala"
                  value={languages}
                  onChange={setLanguages}
                  disabled={uploadBusy}
                />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <Input label="Documento de identidade / Passaporte" value={documentId} onChange={(e) => setDocumentId(e.target.value)} placeholder="Número do documento" />

                {/* Upload + status do arquivo */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">Comprovante de identidade</p>
                    {documentExists ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                        <Clock size={11} />
                        Aguardando validação
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Nenhum arquivo enviado</span>
                    )}
                  </div>

                  {documentExists && documentFileName && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <FileText size={14} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-700 truncate flex-1" title={documentFileName}>
                        {documentFileName}
                      </span>
                      <span className="text-[10px] text-green-600 font-medium flex items-center gap-1 flex-shrink-0">
                        <CheckCircle2 size={11} />
                        Enviado
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => pickFile('document')}
                      disabled={uploadBusy || !canCertOrDocUpload}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <Upload size={13} />
                      {isUploading ? 'Enviando...' : documentExists ? 'Substituir arquivo' : 'Enviar PDF ou imagem'}
                    </button>

                    {documentExists && (
                      <>
                        <button
                          type="button"
                          onClick={() => openDocument('view')}
                          disabled={documentLoading}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          <Eye size={13} />
                          Ver documento
                        </button>
                        <button
                          type="button"
                          onClick={() => openDocument('download')}
                          disabled={documentLoading}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          <Download size={13} />
                          Baixar
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Aceito: PDF, JPG ou PNG (máx. 10MB). Visível apenas para você e administradores.</p>
                </div>
              </div>
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
            <button
              type="button"
              onClick={() => pickFile('certification')}
              disabled={uploadBusy || !canCertOrDocUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-surface-200 bg-surface-50 text-sm font-medium text-slate-700 hover:bg-surface-100 transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              {isUploading ? 'Enviando...' : 'Adicionar certificado (PDF ou JPG/PNG)'}
            </button>
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
