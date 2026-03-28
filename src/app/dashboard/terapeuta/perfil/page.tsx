'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useCallback, useEffect, useState } from 'react'
import { withAuth } from '@/lib/auth-fetch'
import { useTherapistUnifiedUpload } from '@/hooks/useTherapistUnifiedUpload'
import { X, Plus, Save, Upload, FileText, ExternalLink, Trash2, User, Camera, Phone, CreditCard, Eye, Download, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { normalizeLanguagesFromServer } from '@/constants/languages'
import { LanguageMultiSelect } from '@/components/therapist/LanguageMultiSelect'

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
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [yearsExp, setYearsExp] = useState('')
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
        setCertifications(tp.certifications || [])
        setPublicTargetDescription(tp.targetAudience?.specialNeeds ?? '')
        setSessionsPerMonthGoal(tp.sessionsPerMonthGoal != null ? String(tp.sessionsPerMonthGoal) : '')
        setWantCampaigns(tp.wantCampaigns ?? false)
        setAllowAutoScheduling(tp.allowAutoScheduling ?? false)
        setWhatsapp(tp.whatsapp || (row as { phone?: string | null }).phone || '')
        setProfessionalEmail(tp.professionalEmail || '')
        setInstagram(tp.instagram || '')
        setFacebook(tp.facebook || '')
        setWebsiteUrl(tp.websiteUrl || '')
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
        setWhatsapp((row as { phone?: string | null }).phone || '')
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

  const addCert = () => {
    if (newCert.trim()) {
      setCertifications((prev) => [...prev, newCert.trim()])
      setNewCert('')
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
        certifications,
        wantCampaigns,
        allowAutoScheduling,
        publicTargetDescription: publicTargetDescription || null,
        whatsapp: whatsapp || null,
        professionalEmail: professionalEmail || null,
        instagram: instagram || null,
        facebook: facebook || null,
        websiteUrl: websiteUrl || null,
      }
      if (Number.isFinite(priceNum) && priceNum >= 0) profileBody.price = priceNum
      if (yearsNum !== null && Number.isFinite(yearsNum) && yearsNum >= 0) profileBody.yearsExp = yearsNum
      else if (yearsExp.trim() === '') profileBody.yearsExp = null
      if (sessionsGoal !== null && Number.isFinite(sessionsGoal) && sessionsGoal >= 0) {
        profileBody.sessionsPerMonthGoal = sessionsGoal
      } else if (sessionsPerMonthGoal.trim() === '') {
        profileBody.sessionsPerMonthGoal = null
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('[TerapeutaPerfil] save', { profileId, profileKeys: Object.keys(profileBody) })
      }

      const [userRes, profileRes, paymentRes] = await Promise.all([
        fetch(
          `/api/users/${user.id}`,
          withAuth({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              phone: whatsapp.trim() ? whatsapp : '',
              birthDate: birthDate || undefined,
            }),
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
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-6 space-y-6">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <User size={20} className="text-primary-600" />
            Dados pessoais básicos
          </h2>

          <div className="flex items-center gap-6 border-b border-slate-100 pb-8">
            <div
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto profissional" className="h-full w-full object-cover" />
              ) : (
                <User size={32} className="text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <button
                type="button"
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                onClick={() => pickFile('profileImage')}
                disabled={uploadBusy}
              >
                <Camera size={18} className="text-primary-600 shrink-0" />
                {isUploading ? 'Enviando...' : 'Enviar imagem'}
              </button>
              <p className="text-xs text-slate-500">Foto profissional com fundo neutro (recomendado).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Nome profissional"
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              placeholder="Ex.: Dra. Ana Silva"
            />
            <Input label="Data de nascimento" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <Input label="País" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex.: Brasil" />
            <Input label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="Estado (UF)" value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" maxLength={2} />
            <Input label="Nacionalidade" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ex.: Brasileira" />
            <LanguageMultiSelect
              label="Idiomas"
              value={languages}
              onChange={setLanguages}
              disabled={uploadBusy}
            />
            <div className="md:col-span-2">
              <Input
                label="Documento de identidade / Passaporte"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Número do documento"
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700 mb-1">Comprovante de identidade</p>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-800">Arquivo enviado</span>
                  {documentExists ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                      <Clock size={12} />
                      Aguardando validação
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                      Nenhum arquivo
                    </span>
                  )}
                </div>

                {documentExists && documentFileName && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <FileText size={16} className="shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700" title={documentFileName}>
                      {documentFileName}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle2 size={14} />
                      Enviado
                    </span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => pickFile('document')}
                    disabled={uploadBusy || !canCertOrDocUpload}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {isUploading ? 'Enviando...' : documentExists ? 'Substituir arquivo' : 'Enviar PDF ou imagem'}
                  </button>
                  {documentExists && (
                    <>
                      <button
                        type="button"
                        onClick={() => openDocument('view')}
                        disabled={documentLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Eye size={16} />
                        Ver documento
                      </button>
                      <button
                        type="button"
                        onClick={() => openDocument('download')}
                        disabled={documentLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Download size={16} />
                        Baixar
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Aceito: PDF, JPG ou PNG (máx. 10MB). Visível apenas para você e administradores.
                </p>
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
            <div className="sm:col-span-2">
              <PhoneInput
                label="WhatsApp / Telefone"
                value={whatsapp}
                onChange={setWhatsapp}
                hint="Formato internacional: DDI + DDD + número (ex.: +55 11 982586339)."
                className={uploadBusy ? 'opacity-50 pointer-events-none' : undefined}
              />
            </div>
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
            <Input
              label="Preço de referência (R$)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input label="Anos de experiência" type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
            <p className="text-xs text-slate-500 sm:col-span-2 -mt-1">
              Usado na busca quando ainda não há terapias cadastradas em{' '}
              <Link href="/dashboard/terapeuta/terapias" className="font-medium text-primary-600 underline-offset-2 hover:underline">
                Terapias
              </Link>
              . Com terapias ativas, o preço público é o menor entre elas (atualizado ao salvar em Terapias).
            </p>
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
