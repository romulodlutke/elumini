import { Header, StatCard } from '@/components/dashboard/Header'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Users, UserCheck, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

async function getMetrics() {
  const [
    totalTherapists,
    totalPatients,
    totalAppointments,
    pendingApprovals,
    revenueResult,
    recentAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'TERAPEUTA' } }),
    prisma.user.count({ where: { role: 'PACIENTE' } }),
    prisma.appointment.count(),
    prisma.therapistProfile.count({ where: { approved: false } }),
    prisma.appointment.aggregate({
      _sum: { platformRevenue: true },
      where: { status: { in: ['CONFIRMADO', 'CONCLUIDO'] } },
    }),
    prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        therapist: { include: { user: { select: { name: true } } } },
        patient: { include: { user: { select: { name: true } } } },
      },
    }),
  ])

  return {
    totalTherapists,
    totalPatients,
    totalAppointments,
    pendingApprovals,
    totalRevenue: Number(revenueResult._sum.platformRevenue || 0),
    recentAppointments,
  }
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PENDENTE: 'warning',
  CONFIRMADO: 'success',
  CONCLUIDO: 'info',
  CANCELADO: 'danger',
}

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics()

  return (
    <div>
      <Header title="Dashboard Admin" description="Visão geral da plataforma HolosConnect" />

      <div className="p-6 space-y-6">
        {/* Alerta de aprovações pendentes */}
        {metrics.pendingApprovals > 0 && (
          <Link href="/dashboard/admin/therapists" className="block">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm font-medium">
                {metrics.pendingApprovals} terapeuta{metrics.pendingApprovals > 1 ? 's' : ''} aguardando aprovação.
                <span className="underline ml-1">Revisar agora →</span>
              </p>
            </div>
          </Link>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de terapeutas"
            value={metrics.totalTherapists}
            icon={<UserCheck size={20} />}
            color="teal"
            description="Profissionais cadastrados"
          />
          <StatCard
            title="Total de pacientes"
            value={metrics.totalPatients}
            icon={<Users size={20} />}
            color="blue"
            description="Pacientes ativos"
          />
          <StatCard
            title="Total de agendamentos"
            value={metrics.totalAppointments}
            icon={<Calendar size={20} />}
            color="purple"
            description="Todos os status"
          />
          <StatCard
            title="Receita da plataforma"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign size={20} />}
            color="orange"
            description="Comissões recebidas"
          />
        </div>

        {/* Últimos agendamentos */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card">
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="text-base font-semibold text-slate-900">Últimos agendamentos</h2>
            <Link href="/dashboard/admin/reports" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Terapeuta</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {metrics.recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{apt.therapist.user.name}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.patient.user.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(apt.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(Number(apt.price))}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[apt.status] || 'default'} size="sm">
                        {statusLabel[apt.status] || apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {metrics.recentAppointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                      Nenhum agendamento ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
