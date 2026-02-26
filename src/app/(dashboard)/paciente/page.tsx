import { Header, StatCard } from '@/components/dashboard/Header'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDateTime, appointmentStatusConfig } from '@/lib/utils'
import { Calendar, Search, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

async function getPatientData(userId: string) {
  const patient = await prisma.patientProfile.findUnique({
    where: { userId },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          therapist: {
            include: {
              user: { select: { name: true, avatarUrl: true } },
            },
          },
          review: true,
        },
      },
    },
  })

  if (!patient) return null

  const [totalAppointments, upcomingCount] = await Promise.all([
    prisma.appointment.count({ where: { patientId: patient.id } }),
    prisma.appointment.count({
      where: {
        patientId: patient.id,
        status: 'CONFIRMADO',
        date: { gte: new Date() },
      },
    }),
  ])

  return { patient, totalAppointments, upcomingCount }
}

export default async function PacienteDashboardPage() {
  const headersList = headers()
  const userId = headersList.get('x-user-id')!
  const userName = headersList.get('x-user-name')!

  const data = await getPatientData(userId)

  const firstName = userName.split(' ')[0]

  return (
    <div>
      <Header
        title={`Olá, ${firstName}! 🌿`}
        description="Como você está se sentindo hoje?"
      />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total de sessões"
            value={data?.totalAppointments || 0}
            icon={<Calendar size={20} />}
            color="teal"
          />
          <StatCard
            title="Próximas sessões"
            value={data?.upcomingCount || 0}
            icon={<Clock size={20} />}
            color="purple"
            description="Confirmadas"
          />
          <StatCard
            title="Avaliações dadas"
            value={data?.patient.appointments.filter((a) => a.review).length || 0}
            icon={<Star size={20} />}
            color="orange"
          />
        </div>

        {/* CTA buscar terapeuta */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">Encontre seu terapeuta</h3>
            <p className="text-primary-100 text-sm">Mais de 500 profissionais prontos para te atender</p>
          </div>
          <Link href="/dashboard/paciente/buscar">
            <Button variant="secondary" size="lg">
              <Search size={16} />
              Buscar agora
            </Button>
          </Link>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-card">
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="font-semibold text-slate-900">Minhas sessões recentes</h2>
            <Link href="/dashboard/paciente/agendamentos">
              <Button variant="outline" size="sm">Ver todas →</Button>
            </Link>
          </div>
          <div className="divide-y divide-surface-50">
            {!data?.patient.appointments.length ? (
              <div className="px-6 py-12 text-center">
                <Calendar size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium mb-1">Nenhuma sessão ainda</p>
                <p className="text-slate-400 text-xs mb-4">Agende sua primeira sessão com um terapeuta holístico</p>
                <Link href="/dashboard/paciente/buscar">
                  <Button size="sm">Buscar terapeutas</Button>
                </Link>
              </div>
            ) : (
              data.patient.appointments.map((apt) => {
                const statusConfig = appointmentStatusConfig[apt.status]
                const therapistName = apt.therapist.user.name
                const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapistName)}&background=14b8a6&color=fff&size=64`

                return (
                  <div key={apt.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={apt.therapist.user.avatarUrl || avatarFallback}
                        alt={therapistName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{therapistName}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(apt.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900">{formatCurrency(Number(apt.price))}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {apt.status === 'CONCLUIDO' && !apt.review && (
                        <Link href="/dashboard/paciente/agendamentos">
                          <Button size="sm" variant="secondary">Avaliar</Button>
                        </Link>
                      )}
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
