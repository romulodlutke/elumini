'use client'

import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BookingModal } from '@/components/appointments/BookingModal'
import { formatCurrency, getAvatarUrl } from '@/lib/utils'
import { MapPin, Star, Clock, Video, Users, ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface TherapistService {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number
  promoPrice?: number | null
  displayPrice?: number
  currency: string
  modality: string
}

interface TherapistPublic {
  id: string
  bio: string | null
  therapies: string[]
  price: number
  profilePrice?: number
  modality: string
  location: string | null
  city: string | null
  state: string | null
  rating: number
  reviewCount: number
  yearsExp: number | null
  certifications: string[]
  user: { id: string; name: string; avatarUrl: string | null }
  professionalName?: string | null
  availability: { dayOfWeek: number; startTime: string; endTime: string; slotDuration: number }[]
  services?: TherapistService[]
  publicTargetDescription: string | null
  certificates: { id: string; name: string; fileUrl: string }[]
}

export default function TerapeutaPerfilPublicoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [profile, setProfile] = useState<TherapistPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/therapists/${id}/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProfile(data.data)
        else setProfile(null)
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div>
        <Header title="Perfil do terapeuta" description="Carregando..." />
        <div className="p-6 max-w-3xl mx-auto">
          <div className="h-64 bg-white rounded-2xl border border-surface-200 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div>
        <Header title="Perfil não encontrado" description="Este terapeuta não está disponível." />
        <div className="p-6 max-w-3xl mx-auto text-center">
          <p className="text-slate-600 mb-4">O perfil que você buscou não existe ou não está aprovado.</p>
          <Link href="/dashboard/paciente/buscar">
            <Button variant="secondary">Voltar à busca</Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayName = profile.professionalName || profile.user.name
  const avatarUrl = getAvatarUrl(displayName, profile.user.avatarUrl)
  const isOnline = profile.modality === 'ONLINE' || profile.modality === 'AMBOS'
  const isPresencial = profile.modality === 'PRESENCIAL' || profile.modality === 'AMBOS'

  const therapistForBooking = {
    id: profile.id,
    price: profile.price,
    user: { name: displayName },
    availability: profile.availability,
    services: profile.services || [],
  }

  return (
    <div>
      <Header
        title={displayName}
        description="Conheça o profissional antes de agendar"
      />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard/paciente/buscar"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
        >
          <ArrowLeft size={16} />
          Voltar à busca
        </Link>

        {/* Card principal */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
          <div className="bg-gradient-to-b from-sand-100 to-sand-50 p-6 flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={displayName}
                width={120}
                height={120}
                className="rounded-full object-cover border-4 border-white shadow-card"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              {profile.therapies[0] && (
                <p className="text-brand-600 font-medium mt-0.5">{profile.therapies[0]}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-800">{profile.rating.toFixed(1)}</span>
                  <span className="text-slate-500 text-sm">({profile.reviewCount} avaliações)</span>
                </div>
                {profile.yearsExp != null && (
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock size={14} />
                    {profile.yearsExp} anos de experiência
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600">
                {isOnline && (
                  <span className="flex items-center gap-1">
                    <Video size={14} className="text-brand-500" />
                    Online
                  </span>
                )}
                {isPresencial && (
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-brand-500" />
                    Presencial
                  </span>
                )}
                {(profile.city || profile.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {[profile.city, profile.state].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="lg" onClick={() => setShowBooking(true)}>
                  Agendar sessão
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 border-t border-surface-100">
            {profile.bio && (
              <section>
                <h2 className="font-semibold text-slate-900 mb-2">Sobre</h2>
                <p className="text-slate-600 whitespace-pre-wrap">{profile.bio}</p>
              </section>
            )}

            {profile.publicTargetDescription && (
              <section>
                <h2 className="font-semibold text-slate-900 mb-2">Público alvo</h2>
                <p className="text-slate-600 whitespace-pre-wrap">{profile.publicTargetDescription}</p>
              </section>
            )}

            {profile.therapies.length > 0 && (
              <section>
                <h2 className="font-semibold text-slate-900 mb-2">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.therapies.map((t) => (
                    <Badge key={t} variant="default" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {profile.services && profile.services.length > 0 && (
              <section>
                <h2 className="font-semibold text-slate-900 mb-2">Serviços oferecidos</h2>
                <div className="space-y-3">
                  {profile.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-4 rounded-xl border border-surface-200 bg-surface-50"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{svc.name}</p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {svc.durationMinutes} min • {svc.modality === 'ONLINE' ? 'Online' : svc.modality === 'PRESENCIAL' ? 'Presencial' : 'Online e Presencial'}
                          </p>
                          {svc.description && (
                            <p className="text-sm text-slate-600 mt-2">{svc.description}</p>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 flex-shrink-0">
                          {formatCurrency(svc.displayPrice ?? svc.price, svc.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(profile.certifications?.length > 0 || profile.certificates?.length > 0) && (
              <section>
                <h2 className="font-semibold text-slate-900 mb-2">Certificações e documentos</h2>
                {profile.certifications?.length > 0 && (
                  <ul className="list-disc list-inside text-slate-600 mb-3 space-y-1">
                    {profile.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                )}
                {profile.certificates?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.certificates.map((cert) => (
                      <a
                        key={cert.id}
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-surface-200 bg-surface-50 text-slate-700 hover:bg-surface-100 text-sm"
                      >
                        <FileText size={16} />
                        {cert.name}
                        <ExternalLink size={12} className="text-slate-400" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="pt-4 border-t border-surface-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">
                  {profile.services && profile.services.length > 0 ? 'A partir de' : 'Valor da sessão'}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile.services && profile.services.length > 0
                    ? formatCurrency(Math.min(profile.price, ...profile.services.map((s) => s.price)))
                    : formatCurrency(profile.price)}
                </p>
              </div>
              <Button size="lg" onClick={() => setShowBooking(true)}>
                Agendar sessão
              </Button>
            </section>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          isOpen={true}
          onClose={() => setShowBooking(false)}
          therapist={therapistForBooking}
          onSuccess={() => {
            setShowBooking(false)
            toast.success('Agendamento realizado! Aguarde a confirmação.')
            router.push('/dashboard/paciente/agendamentos')
          }}
        />
      )}
    </div>
  )
}
