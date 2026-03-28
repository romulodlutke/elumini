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
      <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5">
        <div className="flex gap-4 items-center">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl}
              alt={displayName}
              width={56}
              height={56}
              className="rounded-full object-cover w-14 h-14 border-2 border-slate-100"
            />
            {therapist.featured && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Star size={8} className="fill-white text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate text-sm">{displayName}</h3>
                <p className="text-xs text-green-600 font-medium mt-0.5">{therapist.therapies[0]}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-slate-900 text-sm">{formatCurrency(Number(therapist.price))}</p>
                <p className="text-xs text-slate-400">por sessão</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-slate-800">{Number(therapist.rating).toFixed(1)}</span>
                <span className="text-xs text-slate-400">({therapist.reviewCount})</span>
              </div>
              {therapist.city && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
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
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer">

      {/* Topo */}
      <div className="relative bg-slate-50 pt-6 pb-4 px-5 flex flex-col items-center text-center border-b border-slate-100">
        {therapist.featured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Star size={8} className="fill-white" />
            Destaque
          </div>
        )}
        <Image
          src={avatarUrl}
          alt={displayName}
          width={72}
          height={72}
          className="rounded-full object-cover w-[72px] h-[72px] border-4 border-white shadow-sm"
        />
        <h3 className="font-semibold text-slate-900 mt-3 text-sm leading-snug">{displayName}</h3>
        <p className="text-xs text-green-600 font-medium mt-0.5">{therapist.therapies[0]}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.round(therapist.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">{Number(therapist.rating).toFixed(1)}</span>
          <span className="text-[11px] text-slate-400">({therapist.reviewCount})</span>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-500">
          {isOnline && (
            <span className="flex items-center gap-1">
              <Video size={11} className="text-green-600" />
              Online
            </span>
          )}
          {isPresencial && (
            <span className="flex items-center gap-1">
              <Users size={11} className="text-green-600" />
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

        <div className="flex flex-wrap gap-1.5 flex-1">
          {therapist.therapies.slice(0, 3).map((t) => (
            <Badge key={t} variant="default" size="sm">{t}</Badge>
          ))}
          {therapist.therapies.length > 3 && (
            <Badge variant="default" size="sm">+{therapist.therapies.length - 3}</Badge>
          )}
        </div>

        {therapist.yearsExp && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={10} />
            {therapist.yearsExp} anos de experiência
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 mt-auto">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">A partir de</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight">{formatCurrency(Number(therapist.price))}</p>
            </div>
            <p className="text-[11px] text-slate-400 mb-0.5">/ sessão</p>
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
