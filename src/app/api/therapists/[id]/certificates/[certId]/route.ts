export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { deleteCertificateFile } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; certId: string } }
) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const cert = await prisma.therapistCertificate.findFirst({
      where: { id: params.certId, therapistId: params.id },
      include: { therapist: true },
    })

    if (!cert) {
      return NextResponse.json({ success: false, error: 'Certificado não encontrado' }, { status: 404 })
    }

    if (cert.therapist.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    await deleteCertificateFile(cert.fileUrl)
    await prisma.therapistCertificate.delete({ where: { id: params.certId } })

    return NextResponse.json({ success: true, message: 'Certificado removido' })
  } catch (error) {
    console.error('[DELETE CERTIFICATE]', error)
    return NextResponse.json({ success: false, error: 'Erro ao remover certificado' }, { status: 500 })
  }
}
