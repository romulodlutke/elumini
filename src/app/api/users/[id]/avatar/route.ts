export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { uploadAvatar } from '@/lib/supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    if (session.sub !== params.id && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'Envie uma imagem (JPEG, PNG, WebP ou GIF)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Formato não permitido. Use JPEG, PNG, WebP ou GIF.' }, { status: 400 })
    }

    const { url, error: uploadError } = await uploadAvatar(file, params.id)
    if (uploadError || !url) {
      return NextResponse.json({ success: false, error: uploadError || 'Falha no upload' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { avatarUrl: url },
    })

    return NextResponse.json({ success: true, data: { avatarUrl: url } })
  } catch (error) {
    console.error('[POST AVATAR]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
