import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function storageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  )
}

/** Supabase / jose devolvem isto quando a service_role no .env está truncada ou não é JWT. */
function friendlyStorageError(message: string | null | undefined): string {
  if (!message) return 'Falha no upload'
  if (/invalid compact jws/i.test(message)) {
    return 'Chave do armazenamento inválida. No .env, use SUPABASE_SERVICE_ROLE_KEY exatamente como no painel Supabase (Project Settings → API), sem aspas quebradas ou espaços.'
  }
  if (/bucket not found/i.test(message)) {
    return 'Bucket de Storage inexistente. No Supabase → Storage, crie os buckets com estes nomes exatos: "documents" (certificados) e "avatars" (fotos de perfil). Veja README → Configuração do Supabase.'
  }
  return message
}

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
  if (!storageConfigured()) {
    return {
      url: null,
      error:
        'Armazenamento não configurado (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).',
    }
  }
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `therapists/${fileName}`

  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .upload(filePath, file, { upsert: true })

    if (error) {
      return { url: null, error: friendlyStorageError(error.message) }
    }

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKETS.AVATARS).getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (process.env.NODE_ENV === 'development') {
      console.error('[uploadAvatar]', e)
    }
    return { url: null, error: friendlyStorageError(msg) || 'Falha de rede no upload' }
  }
}

export async function deleteAvatar(filePath: string): Promise<void> {
  await supabaseAdmin.storage.from(STORAGE_BUCKETS.AVATARS).remove([filePath])
}

// ==========================================
// STORAGE - Certificados (PDF/imagem)
// ==========================================

const ALLOWED_CERT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

/** PDF + JPG + PNG (fluxo unificado /api/upload). */
export const UNIFIED_ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

export const UNIFIED_PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const

export function isAllowedUnifiedFile(mime: string): boolean {
  return (UNIFIED_ALLOWED_FILE_TYPES as readonly string[]).includes(mime)
}

export function isAllowedProfileImage(mime: string): boolean {
  return (UNIFIED_PROFILE_IMAGE_TYPES as readonly string[]).includes(mime)
}

export async function uploadCertificate(
  file: File,
  therapistId: string
): Promise<{ url: string | null; error: string | null }> {
  if (!storageConfigured()) {
    return {
      url: null,
      error:
        'Armazenamento não configurado (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).',
    }
  }
  if (!ALLOWED_CERT_TYPES.includes(file.type)) {
    return { url: null, error: 'Tipo de arquivo não permitido. Use PDF ou imagem (JPEG, PNG, WebP).' }
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80)
  const fileExt = file.name.split('.').pop() || 'pdf'
  const fileName = `${Date.now()}-${safeName}`
  const filePath = `certificates/${therapistId}/${fileName}`

  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filePath, file, { upsert: false })

    if (error) {
      return { url: null, error: friendlyStorageError(error.message) }
    }

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKETS.DOCUMENTS).getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (process.env.NODE_ENV === 'development') {
      console.error('[uploadCertificate]', e)
    }
    return { url: null, error: friendlyStorageError(msg) || 'Falha de rede no upload' }
  }
}

/**
 * Documentos de identidade do terapeuta (RG, CNH, Passaporte).
 * Retorna a URL pública E o storagePath (necessário para signed URLs).
 * Path no bucket: documents/{userId}/{timestamp}-{fileName}
 */
export async function uploadTherapistDocument(
  file: File,
  userId: string
): Promise<{ url: string | null; storagePath: string | null; error: string | null }> {
  if (!storageConfigured()) {
    return {
      url: null,
      storagePath: null,
      error:
        'Armazenamento não configurado (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY).',
    }
  }
  if (!isAllowedUnifiedFile(file.type)) {
    return { url: null, storagePath: null, error: 'Use apenas PDF, JPG ou PNG.' }
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80)
  const fileName = `${Date.now()}-${safeName}`
  const filePath = `documents/${userId}/${fileName}`

  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filePath, file, { upsert: false })

    if (error) {
      return { url: null, storagePath: null, error: friendlyStorageError(error.message) }
    }

    const { data } = supabaseAdmin.storage.from(STORAGE_BUCKETS.DOCUMENTS).getPublicUrl(filePath)

    return { url: data.publicUrl, storagePath: filePath, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (process.env.NODE_ENV === 'development') {
      console.error('[uploadTherapistDocument]', e)
    }
    return { url: null, storagePath: null, error: friendlyStorageError(msg) || 'Falha de rede no upload' }
  }
}

/**
 * Gera uma URL assinada temporária para um documento no bucket 'documents'.
 * Funciona com service_role, independente das RLS policies do bucket.
 * @param storagePath  Caminho relativo ao bucket (ex: "documents/userId/file.pdf")
 * @param expiresIn    Segundos de validade. Padrão: 3600 (1h)
 */
export async function createSignedDocumentUrl(
  storagePath: string,
  expiresIn = 3600
): Promise<{ signedUrl: string | null; error: string | null }> {
  if (!storageConfigured()) {
    return { signedUrl: null, error: 'Armazenamento não configurado.' }
  }
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .createSignedUrl(storagePath, expiresIn)

    if (error || !data?.signedUrl) {
      return { signedUrl: null, error: friendlyStorageError(error?.message) || 'Falha ao gerar URL assinada' }
    }
    return { signedUrl: data.signedUrl, error: null }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { signedUrl: null, error: friendlyStorageError(msg) || 'Falha ao gerar URL assinada' }
  }
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
