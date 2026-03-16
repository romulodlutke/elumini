export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

const updateUserSchema = z.object({
  active: z.boolean().optional(),
  approved: z.boolean().optional(), // para terapeutas
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateUserSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { therapistProfile: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Atualizar status do usuário
    if (validated.data.active !== undefined) {
      await prisma.user.update({
        where: { id: params.id },
        data: { active: validated.data.active },
      })
    }

    // Aprovar/reprovar terapeuta
    if (validated.data.approved !== undefined && user.therapistProfile) {
      await prisma.therapistProfile.update({
        where: { userId: params.id },
        data: { approved: validated.data.approved },
      })

      // Notificar terapeuta
      await prisma.notification.create({
        data: {
          userId: params.id,
          title: validated.data.approved ? 'Cadastro aprovado!' : 'Cadastro em revisão',
          message: validated.data.approved
            ? 'Seu perfil foi aprovado! Agora você pode receber agendamentos na plataforma.'
            : 'Seu perfil está em processo de revisão. Entre em contato com o suporte para mais informações.',
          type: validated.data.approved ? 'SUCCESS' : 'WARNING',
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Usuário atualizado com sucesso' })
  } catch (error) {
    console.error('[ADMIN UPDATE USER]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
