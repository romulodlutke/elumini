import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatar moeda brasileira
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

// Formatar data
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

// Calcular comissão da plataforma
export function calculateCommission(
  price: number,
  commissionRate: number
): { commission: number; therapistNet: number; platformRevenue: number } {
  const commission = price * (commissionRate / 100)
  const therapistNet = price - commission
  const platformRevenue = commission

  return {
    commission: Math.round(commission * 100) / 100,
    therapistNet: Math.round(therapistNet * 100) / 100,
    platformRevenue: Math.round(platformRevenue * 100) / 100,
  }
}

// Iniciais para avatar fallback
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// URL de avatar gerado (fallback)
export function getAvatarUrl(name: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff&size=128`
}

// Sanitizar string (básico)
export function sanitizeString(str: string): string {
  return str.trim().replace(/[<>]/g, '')
}

// Status do agendamento em português com cor
export const appointmentStatusConfig = {
  PENDENTE:   { label: 'Pendente',   color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-green-100 text-green-800'  },
  CONCLUIDO:  { label: 'Concluído',  color: 'bg-blue-100 text-blue-800'   },
  CANCELADO:  { label: 'Cancelado',  color: 'bg-red-100 text-red-800'     },
} as const

// Nomes dos dias da semana
export const daysOfWeek = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
]

// Modalidade em PT
export const modalityLabels: Record<string, string> = {
  ONLINE: 'Online',
  PRESENCIAL: 'Presencial',
  AMBOS: 'Online e Presencial',
}

// Validar email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Gerar horários disponíveis baseado em start/end/duration
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  let current = startHour * 60 + startMin
  const end = endHour * 60 + endMin

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0')
    const m = (current % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += durationMinutes
  }

  return slots
}
