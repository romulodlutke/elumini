export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import {
  uploadAvatar,
  uploadCertificate,
  uploadTherapistDocument,
  isAllowedUnifiedFile,
  isAllowedProfileImage,
} from '@/lib/supabase'

const UPLOAD_TYPES = ['certification', 'profileImage', 'document'] as const
type UploadType = (typeof UPLOAD_TYPES)[number]

function parseUploadType(raw: string | null): UploadType | null {
  if (!raw) return null
  return UPLOAD_TYPES.includes(raw as UploadType) ? (raw as UploadType) : null
}

/**
 * Upload unificado: multipart `file` + `type` (certification | profileImage | document).
 * certification → Supabase `documents/certificates/{therapistProfileId}/…` + registro em TherapistCertificate
 * profileImage → bucket avatars + atualiza User.avatarUrl
 * document → Supabase `documents/documents/{userId}/…` (comprovante; sem coluna dedicada)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = parseUploadType(formData.get('type') as string | null)
    const bodyUserId = formData.get('userId') as string | null
    if (bodyUserId && bodyUserId !== session.sub) {
      return NextResponse.json({ success: false, error: 'Sessão inconsistente' }, { status: 403 })
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Informe type: certification, profileImage ou document' },
        { status: 400 }
      )
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'Selecione um arquivo' }, { status: 400 })
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[POST /api/upload] Tipo:', type, 'Arquivo:', file.name)
    }

    if (type === 'profileImage') {
      if (!isAllowedProfileImage(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Use imagem JPG ou PNG para a foto de perfil.' },
          { status: 400 }
        )
      }
      const { url, error: uploadError } = await uploadAvatar(file, session.sub)
      if (uploadError || !url) {
        return NextResponse.json({ success: false, error: uploadError || 'Falha no upload' }, { status: 400 })
      }
      await prisma.user.update({
        where: { id: session.sub },
        data: { avatarUrl: url },
      })
      return NextResponse.json({ success: true, data: { avatarUrl: url, fileName: file.name } })
    }

    if (session.role !== 'TERAPEUTA' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Apenas terapeutas podem enviar certificados ou documentos por este fluxo.' },
        { status: 403 }
      )
    }

    const profile = await prisma.therapistProfile.findUnique({ where: { userId: session.sub } })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil de terapeuta não encontrado' }, { status: 404 })
    }

    if (type === 'certification') {
      if (!isAllowedUnifiedFile(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Use apenas PDF, JPG ou PNG.' },
          { status: 400 }
        )
      }
      const { url, error: uploadError } = await uploadCertificate(file, profile.id)
      if (uploadError || !url) {
        return NextResponse.json({ success: false, error: uploadError || 'Falha no upload' }, { status: 400 })
      }
      const name =
        ((formData.get('name') as string) || file.name.replace(/\.[^/.]+$/, '') || 'Certificado').slice(0, 200)
      const count = await prisma.therapistCertificate.count({ where: { therapistId: profile.id } })
      const cert = await prisma.therapistCertificate.create({
        data: {
          therapistId: profile.id,
          name,
          fileUrl: url,
          sortOrder: count,
        },
      })
      return NextResponse.json({
        success: true,
        data: { id: cert.id, name: cert.name, fileUrl: cert.fileUrl, fileName: file.name },
      })
    }

    if (type === 'document') {
      if (!isAllowedUnifiedFile(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Use apenas PDF, JPG ou PNG.' },
          { status: 400 }
        )
      }
      const { url, error: uploadError } = await uploadTherapistDocument(file, session.sub)
      if (uploadError || !url) {
        return NextResponse.json({ success: false, error: uploadError || 'Falha no upload' }, { status: 400 })
      }
      return NextResponse.json({ success: true, data: { url, fileName: file.name } })
    }

    return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ success: false, error: 'Erro no upload' }, { status: 500 })
  }
}
