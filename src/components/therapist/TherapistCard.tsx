'use client'

import { cn, formatCurrency, getAvatarUrl } from '@/lib/utils'
import { MapPin, Star, Clock, Video, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'

interface TherapistCardProps {
  therapist: {
    id: string
    therapies: string[]
    price: number | string
    modality: string
    location: string | null
    city: string | null
    rating: number
    reviewCount: number
    bio: string | null
    yearsExp: number | null
    featured?: boolean
    professionalName?: string | null
    user: {
      id: string
      name: string
      avatarUrl: string | null
    }
  }
  onBook?: (therapistId: string) => void
  onView?: (therapistId: string) => void
  variant?: 'grid' | 'list'
}

export function TherapistCard({ therapist, onBook, onView, variant = 'grid' }: TherapistCardProps) {
  const displayName = therapist.professionalName || therapist.user.name
  const avatarUrl = getAvatarUrl(displayName, therapist.user.avatarUrl)
  const isOnline = therapist.modality === 'ONLINE' || therapist.modality === 'AMBOS'
  const isPresencial = therapist.modality === 'PRESENCIAL' || therapist.modality === 'AMBOS'

  if (variant === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-sand-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5">
        <div className="flex gap-4 items-center">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={64}
              height={64}
              className="rounded-full object-cover w-16 h-16 border-2 border-sand-200"
            />
            {therapist.featured && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Star size={9} className="fill-white text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-sand-900 truncate text-sm">{displayName}</h3>
                <p className="text-xs text-brand-500 font-medium mt-0.5">{therapist.therapies[0]}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sand-900 text-sm">{formatCurrency(Number(therapist.price))}</p>
                <p className="text-xs text-sand-400">por sessão</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-sand-800">{Number(therapist.rating).toFixed(1)}</span>
                <span className="text-xs text-sand-400">({therapist.reviewCount})</span>
              </div>
              {therapist.city && (
                <span className="flex items-center gap-1 text-xs text-sand-400">
                  <MapPin size={10} />
                  {therapist.city}
                </span>
              )}
              <div className="flex gap-1.5 ml-auto">
                {onView && <Button variant="outline" size="sm" onClick={() => onView(therapist.id)}>Ver perfil</Button>}
                {onBook && <Button size="sm" onClick={() => onBook(therapist.id)}>Agendar</Button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid card
  return (
    <div className="group bg-white rounded-2xl border border-sand-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer">

      {/* Topo com gradiente areia */}
      <div className="relative bg-gradient-to-b from-sand-100 to-sand-50 pt-6 pb-4 px-6 flex flex-col items-center text-center border-b border-sand-100">
        {therapist.featured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-pill flex items-center gap-1 tracking-wide">
            <Star size={9} className="fill-white" />
            Destaque
          </div>
        )}
        <div className="relative">
          <Image
            src={avatarUrl}
            alt={displayName}
            width={80}
            height={80}
            className="rounded-full object-cover w-20 h-20 border-4 border-white shadow-card"
          />
        </div>
        <h3 className="font-semibold text-sand-900 mt-3 text-sm leading-snug">{displayName}</h3>
        <p className="text-xs text-brand-500 font-semibold mt-0.5 uppercase tracking-wider">{therapist.therapies[0]}</p>
        {/* Estrelas */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.round(therapist.rating) ? 'fill-amber-400 text-amber-400' : 'text-sand-300'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-sand-700">{Number(therapist.rating).toFixed(1)}</span>
          <span className="text-[11px] text-sand-400">({therapist.reviewCount})</span>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Modalidade + local */}
        <div className="flex items-center gap-2.5 text-xs text-sand-500">
          {isOnline && (
            <span className="flex items-center gap-1">
              <Video size={11} className="text-brand-500" />
              Online
            </span>
          )}
          {isPresencial && (
            <span className="flex items-center gap-1">
              <Users size={11} className="text-brand-500" />
              Presencial
            </span>
          )}
          {therapist.city && (
            <span className="flex items-center gap-1 ml-auto">
              <MapPin size={10} />
              {therapist.city}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 flex-1">
          {therapist.therapies.slice(0, 3).map((t) => (
            <Badge key={t} variant="default" size="sm">{t}</Badge>
          ))}
          {therapist.therapies.length > 3 && (
            <Badge variant="default" size="sm">+{therapist.therapies.length - 3}</Badge>
          )}
        </div>

        {/* Exp */}
        {therapist.yearsExp && (
          <div className="flex items-center gap-1 text-[11px] text-sand-400">
            <Clock size={10} />
            {therapist.yearsExp} anos de experiência
          </div>
        )}

        {/* Preço + CTA */}
        <div className="border-t border-sand-100 pt-3 mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] text-sand-400 uppercase tracking-wider">A partir de</p>
              <p className="text-xl font-bold text-sand-900">{formatCurrency(Number(therapist.price))}</p>
            </div>
            <p className="text-[11px] text-sand-400 mb-1">/ sessão</p>
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" fullWidth onClick={() => onView(therapist.id)}>
                Ver perfil
              </Button>
            )}
            {onBook && (
              <Button size="sm" fullWidth onClick={() => onBook(therapist.id)}>
                Agendar sessão
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
