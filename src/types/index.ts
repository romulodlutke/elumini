import { Role, AppointmentStatus, Modality, Gender } from '@prisma/client'

export type { Role, AppointmentStatus, Modality, Gender }

// ==========================================
// TIPOS DE API RESPONSE
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ==========================================
// TIPOS DE AUTENTICAÇÃO
// ==========================================

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: Role
}

// ==========================================
// TIPOS DE USUÁRIO
// ==========================================

export interface UserPublic {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  avatarUrl: string | null
  phone: string | null
  createdAt: Date
}

// ==========================================
// TIPOS DE TERAPEUTA
// ==========================================

export interface TherapistWithProfile extends UserPublic {
  therapistProfile: {
    id: string
    bio: string | null
    therapies: string[]
    price: number
    modality: Modality
    location: string | null
    city: string | null
    state: string | null
    rating: number
    reviewCount: number
    approved: boolean
    featured: boolean
    yearsExp: number | null
    certifications: string[]
    languages: string[]
  } | null
}

export interface TherapistSearchParams {
  therapy?: string
  modality?: Modality
  minPrice?: number
  maxPrice?: number
  minRating?: number
  city?: string
  state?: string
  page?: number
  perPage?: number
  search?: string
}

// ==========================================
// TIPOS DE AGENDAMENTO
// ==========================================

export interface AppointmentWithDetails {
  id: string
  date: Date
  durationMinutes: number
  status: AppointmentStatus
  price: number
  commissionRate: number
  commission: number | null
  therapistNet: number | null
  platformRevenue: number | null
  notes: string | null
  therapist: {
    id: string
    userId: string
    user: { name: string; avatarUrl: string | null }
    therapies: string[]
    modality: Modality
  }
  patient: {
    id: string
    userId: string
    user: { name: string; avatarUrl: string | null }
  }
  review: ReviewPublic | null
}

export interface CreateAppointmentRequest {
  therapistProfileId: string
  date: string
  time: string
  notes?: string
}

// ==========================================
// TIPOS DE AVALIAÇÃO
// ==========================================

export interface ReviewPublic {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  author: { name: string; avatarUrl: string | null }
}

export interface CreateReviewRequest {
  appointmentId: string
  rating: number
  comment?: string
}

// ==========================================
// TIPOS DE ANAMNESE
// ==========================================

export interface Anamnese {
  idade?: number
  genero?: Gender
  objetivo: string
  historicoEmocional?: string
  medicamentos?: string
  preferencia?: Modality
  alergias?: string
  condicoesCronicas?: string
  expectativas?: string
  outrasInfo?: string
}

// ==========================================
// TIPOS DO DASHBOARD ADMIN
// ==========================================

export interface AdminDashboardMetrics {
  totalTherapists: number
  totalPatients: number
  totalAppointments: number
  totalRevenue: number
  pendingApprovals: number
  appointmentsByStatus: Record<AppointmentStatus, number>
  revenueByMonth: Array<{ month: string; revenue: number }>
}
