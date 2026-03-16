export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { PaymentMethod } from '@prisma/client'

const paymentMethodsEnum = [
  'PIX',
  'CREDITO',
  'DEBITO',
  'BOLETO',
  'TRANSFERENCIA',
  'PAYPAL',
  'STRIPE',
  'MERCADOPAGO',
  'PREX',
  'CRIPTOMOEDA',
  'DINHEIRO',
] as const

const patchSchema = z.object({
  paymentMethods: z.array(z.enum(paymentMethodsEnum)).optional(),
  accountHolderName: z.string().max(200).optional().nullable(),
  bankName: z.string().max(200).optional().nullable(),
  accountNumber: z.string().max(100).optional().nullable(),
  pixKey: z.string().max(200).optional().nullable(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionFromRequest(_request)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    const profile = await prisma.therapistProfile.findUnique({
      where: { id: params.id },
      include: {
        paymentMethods: true,
        paymentDetails: true,
      },
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (profile.userId !== session.sub && session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 })
    }

    const paymentMethods = profile.paymentMethods.map((pm) => pm.method)
    const paymentDetails = profile.paymentDetails
      ? {
          accountHolderName: profile.paymentDetails.accountHolderName,
          bankName: profile.paymentDetails.bankName,
          accountNumber: profile.paymentDetails.accountNumber,
          pixKey: profile.paymentDetails.pixKey,
        }
      : null

    return NextResponse.json({
      success: true,
      data: { paymentMethods, paymentDetails },
    })
  } catch (error) {
    console.error('[GET THERAPIST PAYMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

export async function PATCH(
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

    const body = await request.json()
    const validated = patchSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.errors[0].message },
        { status: 400 }
      )
    }

    const { paymentMethods, accountHolderName, bankName, accountNumber, pixKey } = validated.data

    await prisma.$transaction(async (tx) => {
      if (paymentMethods !== undefined) {
        await tx.therapistPaymentMethod.deleteMany({ where: { therapistId: params.id } })
        if (paymentMethods.length > 0) {
          await tx.therapistPaymentMethod.createMany({
            data: paymentMethods.map((method) => ({
              therapistId: params.id,
              method: method as PaymentMethod,
            })),
          })
        }
      }

      if (
        accountHolderName !== undefined ||
        bankName !== undefined ||
        accountNumber !== undefined ||
        pixKey !== undefined
      ) {
        const existing = await tx.therapistPaymentDetails.findUnique({
          where: { therapistId: params.id },
        })
        const merged = {
          accountHolderName: accountHolderName !== undefined ? accountHolderName : existing?.accountHolderName ?? null,
          bankName: bankName !== undefined ? bankName : existing?.bankName ?? null,
          accountNumber: accountNumber !== undefined ? accountNumber : existing?.accountNumber ?? null,
          pixKey: pixKey !== undefined ? pixKey : existing?.pixKey ?? null,
        }
        await tx.therapistPaymentDetails.upsert({
          where: { therapistId: params.id },
          create: { therapistId: params.id, ...merged },
          update: merged,
        })
      }
    })

    return NextResponse.json({ success: true, message: 'Pagamento atualizado' })
  } catch (error) {
    console.error('[PATCH THERAPIST PAYMENT]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
