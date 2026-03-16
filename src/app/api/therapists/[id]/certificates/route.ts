export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { uploadCertificate } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const name = (formData.get('name') as string) || file?.name || 'Certificado'

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'Envie um arquivo (PDF ou imagem)' }, { status: 400 })
    }

    const { url, error: uploadError } = await uploadCertificate(file, params.id)
    if (uploadError || !url) {
      return NextResponse.json({ success: false, error: uploadError || 'Falha no upload' }, { status: 400 })
    }

    const count = await prisma.therapistCertificate.count({ where: { therapistId: params.id } })
    const cert = await prisma.therapistCertificate.create({
      data: {
        therapistId: params.id,
        name: name.slice(0, 200),
        fileUrl: url,
        sortOrder: count,
      },
    })

    return NextResponse.json({ success: true, data: { id: cert.id, name: cert.name, fileUrl: cert.fileUrl } })
  } catch (error) {
    console.error('[POST CERTIFICATE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao enviar certificado' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const certificates = await prisma.therapistCertificate.findMany({
      where: { therapistId: params.id },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, fileUrl: true },
    })

    return NextResponse.json({ success: true, data: certificates })
  } catch (error) {
    console.error('[GET CERTIFICATES]', error)
    return NextResponse.json({ success: false, error: 'Erro ao listar certificados' }, { status: 500 })
  }
}
