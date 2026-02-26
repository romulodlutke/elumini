'use client'

import { cn, formatCurrency, getAvatarUrl, modalityLabels } from '@/lib/utils'
import { MapPin, Star, Clock, Video, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
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
  const avatarUrl = getAvatarUrl(therapist.user.name, therapist.user.avatarUrl)
  const isOnline = therapist.modality === 'ONLINE' || therapist.modality === 'AMBOS'
  const isPresencial = therapist.modality === 'PRESENCIAL' || therapist.modality === 'AMBOS'

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300 p-5">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarUrl}
              alt={therapist.user.name}
              width={72}
              height={72}
              className="rounded-xl object-cover w-[72px] h-[72px]"
            />
            {therapist.featured && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <Star size={10} className="fill-white text-white" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 truncate">{therapist.user.name}</h3>
                <p className="text-sm text-slate-500 truncate">{therapist.therapies[0]}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900 text-sm">{formatCurrency(Number(therapist.price))}</p>
                <p className="text-xs text-slate-400">por sessão</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <StarRating value={therapist.rating} size="sm" showValue />
              <span className="text-xs text-slate-400">({therapist.reviewCount})</span>
              {therapist.city && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={10} />
                  {therapist.city}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1.5 flex-wrap">
                {therapist.therapies.slice(0, 2).map((t) => (
                  <Badge key={t} variant="default" size="sm">{t}</Badge>
                ))}
                {therapist.therapies.length > 2 && (
                  <Badge variant="default" size="sm">+{therapist.therapies.length - 2}</Badge>
                )}
              </div>
              <div className="ml-auto flex gap-2">
                {onView && (
                  <Button variant="outline" size="sm" onClick={() => onView(therapist.id)}>
                    Ver perfil
                  </Button>
                )}
                {onBook && (
                  <Button size="sm" onClick={() => onBook(therapist.id)}>
                    Agendar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white rounded-2xl border border-surface-200 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      {/* Imagem + featured badge */}
      <div className="relative bg-gradient-to-br from-primary-50 to-accent-50 p-6 flex flex-col items-center">
        {therapist.featured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star size={10} className="fill-white" />
            Destaque
          </div>
        )}
        <Image
          src={avatarUrl}
          alt={therapist.user.name}
          width={88}
          height={88}
          className="rounded-full object-cover w-[88px] h-[88px] border-4 border-white shadow-md"
        />
        <div className="mt-3 text-center">
          <h3 className="font-semibold text-slate-900">{therapist.user.name}</h3>
          <p className="text-sm text-primary-600 font-medium mt-0.5">{therapist.therapies[0]}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <StarRating value={therapist.rating} size="sm" showValue />
          <span className="text-xs text-slate-400">({therapist.reviewCount} avaliações)</span>
        </div>
      </div>

      {/* Infos */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Modalidade */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          {isOnline && (
            <span className="flex items-center gap-1">
              <Video size={12} className="text-primary-500" />
              Online
            </span>
          )}
          {isPresencial && (
            <span className="flex items-center gap-1">
              <Users size={12} className="text-primary-500" />
              Presencial
            </span>
          )}
          {therapist.city && (
            <span className="flex items-center gap-1 ml-auto">
              <MapPin size={12} />
              {therapist.city}
            </span>
          )}
        </div>

        {/* Tags de terapias */}
        <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
          {therapist.therapies.slice(0, 3).map((t) => (
            <Badge key={t} variant="default" size="sm">{t}</Badge>
          ))}
          {therapist.therapies.length > 3 && (
            <Badge variant="default" size="sm">+{therapist.therapies.length - 3}</Badge>
          )}
        </div>

        {/* Anos de exp */}
        {therapist.yearsExp && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <Clock size={11} />
            {therapist.yearsExp} anos de experiência
          </div>
        )}

        {/* Preço + CTA */}
        <div className="border-t border-surface-100 pt-3 mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400">A partir de</span>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(Number(therapist.price))}</p>
            </div>
            <span className="text-xs text-slate-400">/ sessão</span>
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button variant="outline" size="sm" fullWidth onClick={() => onView(therapist.id)}>
                Ver perfil
              </Button>
            )}
            {onBook && (
              <Button size="sm" fullWidth onClick={() => onBook(therapist.id)}>
                Agendar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
