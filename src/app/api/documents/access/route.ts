export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createSignedDocumentUrl } from '@/lib/supabase'

/**
 * GET /api/documents/access?userId=<id>
 *
 * Gera uma URL assinada temporária (1h) para o documento de identidade do terapeuta.
 *
 * Regras de acesso:
 *  - ADMIN: pode acessar qualquer terapeuta passando ?userId=<id>
 *  - TERAPEUTA: só pode acessar o próprio documento (userId ignorado)
 *  - Qualquer outro perfil: 403
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    if (session.role !== 'ADMIN' && session.role !== 'TERAPEUTA') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas terapeutas e administradores.' },
        { status: 403 }
      )
    }

    // Determina qual userId buscar
    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')

    let targetUserId: string

    if (session.role === 'ADMIN') {
      // Admin pode acessar qualquer terapeuta. Se não passar userId, acessa o próprio.
      targetUserId = queryUserId || session.sub
    } else {
      // Terapeuta só pode acessar o próprio documento
      if (queryUserId && queryUserId !== session.sub) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Você só pode visualizar seus próprios documentos.' },
          { status: 403 }
        )
      }
      targetUserId = session.sub
    }

    // Busca o perfil do terapeuta
    const profile = await prisma.therapistProfile.findUnique({
      where: { userId: targetUserId },
      select: {
        id: true,
        documentUrl: true,
        documentFileName: true,
        userId: true,
        user: { select: { name: true } },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Perfil de terapeuta não encontrado.' },
        { status: 404 }
      )
    }

    if (!profile.documentUrl) {
      return NextResponse.json(
        { success: false, error: 'Nenhum documento foi enviado ainda.' },
        { status: 404 }
      )
    }

    // Gera URL assinada válida por 1 hora
    const { signedUrl, error } = await createSignedDocumentUrl(profile.documentUrl, 3600)

    if (error || !signedUrl) {
      console.error('[GET /api/documents/access] Erro ao gerar signed URL:', error)
      return NextResponse.json(
        { success: false, error: error || 'Falha ao gerar URL de acesso.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        fileName: profile.documentFileName || 'documento',
        therapistName: profile.user.name,
        expiresIn: 3600,
      },
    })
  } catch (error) {
    console.error('[GET /api/documents/access]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
