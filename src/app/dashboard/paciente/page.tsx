export const dynamic = 'force-dynamic'

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
        title={`Olá, ${firstName}!`}
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
        <div className="bg-brand-500 rounded-2xl p-6 text-white flex items-center justify-between gap-4">
          <div>
            <p className="text-brand-100/70 text-xs font-semibold uppercase tracking-widest mb-1">Marketplace</p>
            <h3 className="font-bold text-lg leading-tight mb-1">Encontre seu terapeuta</h3>
            <p className="text-brand-100/80 text-sm">Mais de 500 profissionais prontos para te atender</p>
          </div>
          <Link href="/dashboard/paciente/buscar" className="flex-shrink-0">
            <Button className="bg-white text-brand-600 hover:bg-sand-50 shadow-sm" size="md">
              <Search size={15} />
              Buscar agora
            </Button>
          </Link>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-2xl border border-sand-200 shadow-card">
          <div className="flex items-center justify-between p-5 border-b border-sand-100">
            <h2 className="font-semibold text-sand-900 text-sm">Minhas sessões recentes</h2>
            <Link href="/dashboard/paciente/agendamentos">
              <Button variant="outline" size="sm">Ver todas →</Button>
            </Link>
          </div>
          <div className="divide-y divide-sand-50">
            {!data?.patient.appointments.length ? (
              <div className="px-6 py-12 text-center">
                <Calendar size={32} className="text-sand-200 mx-auto mb-3" />
                <p className="text-sand-600 text-sm font-semibold mb-1">Nenhuma sessão ainda</p>
                <p className="text-sand-400 text-xs mb-5">Agende sua primeira sessão com um terapeuta holístico</p>
                <Link href="/dashboard/paciente/buscar">
                  <Button size="sm">Buscar terapeutas</Button>
                </Link>
              </div>
            ) : (
              data.patient.appointments.map((apt) => {
                const statusConfig = appointmentStatusConfig[apt.status]
                const therapistName = apt.therapist.user.name
                const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapistName)}&background=3A8D7B&color=fff&size=64`

                return (
                  <div key={apt.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-sand-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Image
                        src={apt.therapist.user.avatarUrl || avatarFallback}
                        alt={therapistName}
                        width={38}
                        height={38}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-sand-900">{therapistName}</p>
                        <p className="text-xs text-sand-400">{formatDateTime(apt.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-sand-900">{formatCurrency(Number(apt.price))}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-pill font-semibold ${statusConfig.color}`}>
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
