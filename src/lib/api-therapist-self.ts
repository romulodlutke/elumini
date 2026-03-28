import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { JWTPayload } from '@/lib/auth'

type Ok = { ok: true; profileId: string }
type Err = { ok: false; response: NextResponse }

/** Terapeuta logado → id do TherapistProfile (para rotas /api/therapies etc.). */
export async function requireTherapistProfileForApi(session: JWTPayload | null): Promise<Ok | Err> {
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 }),
    }
  }
  if (session.role !== 'TERAPEUTA') {
    return {
      ok: false,
      response: NextResponse.json({ success: false, error: 'Apenas terapeutas' }, { status: 403 }),
    }
  }
  const profile = await prisma.therapistProfile.findUnique({
    where: { userId: session.sub },
    select: { id: true },
  })
  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: 'Perfil de terapeuta não encontrado' },
        { status: 404 }
      ),
    }
  }
  return { ok: true, profileId: profile.id }
}
