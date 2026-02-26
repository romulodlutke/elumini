import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    const [
      totalTherapists,
      totalPatients,
      totalAppointments,
      pendingApprovals,
      revenueResult,
      appointmentsByStatus,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'TERAPEUTA' } }),
      prisma.user.count({ where: { role: 'PACIENTE' } }),
      prisma.appointment.count(),
      prisma.therapistProfile.count({ where: { approved: false } }),
      prisma.appointment.aggregate({
        _sum: { platformRevenue: true },
        where: { status: { in: ['CONFIRMADO', 'CONCLUIDO'] } },
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    // Receita por mês (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const revenueByMonth = await prisma.appointment.findMany({
      where: {
        status: { in: ['CONFIRMADO', 'CONCLUIDO'] },
        date: { gte: sixMonthsAgo },
      },
      select: { date: true, platformRevenue: true },
    })

    const monthlyRevenue: Record<string, number> = {}
    revenueByMonth.forEach((apt) => {
      const key = apt.date.toISOString().slice(0, 7) // YYYY-MM
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(apt.platformRevenue || 0)
    })

    return NextResponse.json({
      success: true,
      data: {
        totalTherapists,
        totalPatients,
        totalAppointments,
        totalRevenue: Number(revenueResult._sum.platformRevenue || 0),
        pendingApprovals,
        appointmentsByStatus: Object.fromEntries(
          appointmentsByStatus.map((a) => [a.status, a._count.status])
        ),
        revenueByMonth: Object.entries(monthlyRevenue)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
    })
  } catch (error) {
    console.error('[ADMIN DASHBOARD]', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
