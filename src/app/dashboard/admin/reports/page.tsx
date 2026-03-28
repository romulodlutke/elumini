export const dynamic = 'force-dynamic'

import { Header, StatCard } from '@/components/dashboard/Header'
import { Badge } from '@/components/ui/Badge'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react'

async function getReportData() {
  const [
    allAppointments,
    revenueByMonth,
    platformConfig,
    topTherapists,
  ] = await Promise.all([
    prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        therapist: { include: { user: { select: { name: true } } } },
        patient:  { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.appointment.groupBy({
      by: ['createdAt'],
      where: { status: { in: ['CONFIRMADO', 'CONCLUIDO'] } },
      _sum: { platformRevenue: true, price: true },
    }),
    prisma.platformConfig.findFirst({ orderBy: { updatedAt: 'desc' } }),
    prisma.therapistProfile.findMany({
      orderBy: { reviewCount: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ])

  const totalRevenue = allAppointments
    .filter((a) => ['CONFIRMADO', 'CONCLUIDO'].includes(a.status))
    .reduce((sum, a) => sum + Number(a.platformRevenue || 0), 0)

  const totalBilled = allAppointments
    .filter((a) => ['CONFIRMADO', 'CONCLUIDO'].includes(a.status))
    .reduce((sum, a) => sum + Number(a.price || 0), 0)

  const totalConfirmed = allAppointments.filter((a) =>
    ['CONFIRMADO', 'CONCLUIDO'].includes(a.status)
  ).length

  const totalCanceled = allAppointments.filter((a) => a.status === 'CANCELADO').length

  return {
    allAppointments,
    totalRevenue,
    totalBilled,
    totalConfirmed,
    totalCanceled,
    commissionRate: Number(platformConfig?.commissionRate || 10),
    topTherapists,
  }
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  PENDENTE:   'warning',
  CONFIRMADO: 'success',
  CONCLUIDO:  'info',
  CANCELADO:  'danger',
}

const statusLabel: Record<string, string> = {
  PENDENTE:   'Pendente',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO:  'Concluído',
  CANCELADO:  'Cancelado',
}

export default async function AdminReportsPage() {
  const data = await getReportData()

  return (
    <div>
      <Header
        title="Relatórios Financeiros"
        description="Histórico de agendamentos, receitas e comissões da plataforma"
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita da plataforma"
            value={formatCurrency(data.totalRevenue)}
            icon={<DollarSign size={20} />}
            color="teal"
            description="Comissões recebidas"
          />
          <StatCard
            title="Volume faturado"
            value={formatCurrency(data.totalBilled)}
            icon={<TrendingUp size={20} />}
            color="blue"
            description="Total de sessões pagas"
          />
          <StatCard
            title="Sessões confirmadas"
            value={data.totalConfirmed}
            icon={<Calendar size={20} />}
            color="purple"
            description="Confirmadas ou concluídas"
          />
          <StatCard
            title="Taxa de comissão"
            value={`${data.commissionRate}%`}
            icon={<Percent size={20} />}
            color="orange"
            description="Configurada atualmente"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tabela principal */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100">
              <h2 className="text-base font-semibold text-slate-900">Histórico de agendamentos</h2>
              <p className="text-xs text-slate-500 mt-0.5">Últimos 50 registros</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Terapeuta</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Comissão</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {data.allAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                        Nenhum agendamento encontrado
                      </td>
                    </tr>
                  ) : (
                    data.allAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-surface-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-900 text-xs">
                          {apt.therapist.user.name}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 text-xs">
                          {apt.patient.user.name}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(apt.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-900 text-xs">
                          {formatCurrency(Number(apt.price))}
                        </td>
                        <td className="px-6 py-3.5 text-xs">
                          {['CONFIRMADO', 'CONCLUIDO'].includes(apt.status) ? (
                            <span className="text-teal-700 font-medium">
                              {formatCurrency(Number(apt.platformRevenue || 0))}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant={statusVariant[apt.status] || 'default'} size="sm">
                            {statusLabel[apt.status] || apt.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar direita */}
          <div className="space-y-4">
            {/* Resumo de status */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Resumo por status</h3>
              <div className="space-y-3">
                {[
                  { label: 'Confirmados/Concluídos', count: data.totalConfirmed, color: 'bg-green-500' },
                  { label: 'Cancelados', count: data.totalCanceled, color: 'bg-red-400' },
                  {
                    label: 'Pendentes',
                    count: data.allAppointments.filter((a) => a.status === 'PENDENTE').length,
                    color: 'bg-amber-400',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-slate-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top terapeutas */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Top terapeutas</h3>
              <div className="space-y-3">
                {data.topTherapists.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum dado ainda</p>
                ) : (
                  data.topTherapists.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{t.user.name}</p>
                        <p className="text-xs text-slate-500">
                          {t.reviewCount} avaliações · média {Number(t.rating).toFixed(1)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-teal-700">
                        {formatCurrency(Number(t.price))}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Receita vs Volume */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white">
              <p className="text-xs font-medium opacity-80 mb-1">Margem média</p>
              <p className="text-3xl font-bold">{data.commissionRate}%</p>
              <p className="text-xs opacity-70 mt-1">de comissão por sessão</p>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Volume total</span>
                  <span className="font-semibold">{formatCurrency(data.totalBilled)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Receita plataforma</span>
                  <span className="font-semibold">{formatCurrency(data.totalRevenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
