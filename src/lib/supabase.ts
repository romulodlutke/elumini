import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente público (frontend) — usa a chave anon, respeita Row Level Security
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin (backend/server-side) — usa service_role, bypassa RLS
// Usar SOMENTE em Server Actions e API Routes seguras
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ==========================================
// STORAGE - Upload de avatares dos terapeutas
// ==========================================

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
} as const

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `therapists/${fileName}`

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filePath, file, { upsert: true })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .getPublicUrl(filePath)

  return { url: data.publicUrl, error: null }
}

export async function deleteAvatar(filePath: string): Promise<void> {
  await supabaseAdmin.storage.from(STORAGE_BUCKETS.AVATARS).remove([filePath])
}

// ==========================================
// STORAGE - Certificados (PDF/imagem)
// ==========================================

const ALLOWED_CERT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export async function uploadCertificate(
  file: File,
  therapistId: string
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_CERT_TYPES.includes(file.type)) {
    return { url: null, error: 'Tipo de arquivo não permitido. Use PDF ou imagem (JPEG, PNG, WebP).' }
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80)
  const fileExt = file.name.split('.').pop() || 'pdf'
  const fileName = `${Date.now()}-${safeName}`
  const filePath = `certificates/${therapistId}/${fileName}`

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .upload(filePath, file, { upsert: false })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKETS.DOCUMENTS)
    .getPublicUrl(filePath)

  return { url: data.publicUrl, error: null }
}

export async function deleteCertificateFile(fileUrl: string): Promise<void> {
  try {
    const url = new URL(fileUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/documents\/(.+)/)
    if (pathMatch) {
      await supabaseAdmin.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove([pathMatch[1]])
    }
  } catch {
    // ignore invalid URL
  }
}
