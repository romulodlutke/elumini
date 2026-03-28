export const dynamic = 'force-dynamic'

import { Header, StatCard } from '@/components/dashboard/Header'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime, appointmentStatusConfig } from '@/lib/utils'
import { Calendar, DollarSign, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

async function getTherapistData(userId: string) {
  const therapist = await prisma.therapistProfile.findUnique({
    where: { userId },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          patient: { include: { user: { select: { name: true, avatarUrl: true } } } },
        },
      },
    },
  })

  if (!therapist) return null

  const [totalAppointments, revenue, confirmedCount] = await Promise.all([
    prisma.appointment.count({ where: { therapistId: therapist.id } }),
    prisma.appointment.aggregate({
      _sum: { therapistNet: true },
      where: { therapistId: therapist.id, status: { in: ['CONFIRMADO', 'CONCLUIDO'] } },
    }),
    prisma.appointment.count({
      where: { therapistId: therapist.id, status: 'PENDENTE' },
    }),
  ])

  return {
    therapist,
    totalAppointments,
    totalRevenue: Number(revenue._sum.therapistNet || 0),
    pendingCount: confirmedCount,
  }
}

export default async function TerapeutaDashboardPage() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')!
  const userName = headersList.get('x-user-name')!

  const data = await getTherapistData(userId)

  if (!data?.therapist) {
    return (
      <div>
        <Header title="Meu Dashboard" />
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-amber-900 mb-2">Complete seu perfil</h3>
            <p className="text-amber-700 text-sm mb-4">
              Complete seu perfil de terapeuta para começar a receber agendamentos.
            </p>
            <Link href="/dashboard/terapeuta/perfil">
              <Button>Completar perfil</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { therapist, totalAppointments, totalRevenue, pendingCount } = data

  return (
    <div>
      <Header
        title={`Olá, ${userName.split(' ')[0]}!`}
        description={therapist.approved ? 'Seu perfil está ativo e visível para pacientes' : 'Aguardando aprovação do perfil'}
      />

      <div className="p-6 space-y-6">
        {!therapist.approved && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            ⏳ Seu perfil está em análise. Você receberá uma notificação quando for aprovado.
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Agendamentos"
            value={totalAppointments}
            icon={<Calendar size={20} />}
            color="teal"
          />
          <StatCard
            title="Pendentes"
            value={pendingCount}
            icon={<Users size={20} />}
            color="purple"
            description="Aguardando sua confirmação"
          />
          <StatCard
            title="Sua receita líquida"
            value={formatCurrency(totalRevenue)}
            icon={<DollarSign size={20} />}
            color="orange"
            description="Após comissão da plataforma"
          />
          <StatCard
            title="Avaliação média"
            value={therapist.rating.toFixed(1)}
            icon={<Star size={20} />}
            color="blue"
            description={`${therapist.reviewCount} avaliações`}
          />
        </div>

        {/* Próximos agendamentos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Últimos agendamentos</h2>
            <Link href="/dashboard/terapeuta/agenda">
              <Button variant="outline" size="sm">Ver agenda →</Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {therapist.appointments.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                Nenhum agendamento ainda. Complete seu perfil para aparecer nas buscas.
              </div>
            ) : (
              therapist.appointments.map((apt) => {
                const statusConfig = appointmentStatusConfig[apt.status]
                return (
                  <div key={apt.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0 border border-green-100">
                        {apt.patient.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{apt.patient.user.name}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(apt.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(Number(apt.price))}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
