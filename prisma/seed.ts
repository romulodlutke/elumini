import { PrismaClient, Role, Modality, AppointmentStatus, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados HolosConnect...')

  // Limpar dados existentes (ordem importa por causa das FK)
  await prisma.notification.deleteMany()
  await prisma.review.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.therapistProfile.deleteMany()
  await prisma.patientProfile.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await prisma.platformConfig.deleteMany()

  // ==========================================
  // CONFIGURAÇÃO DA PLATAFORMA
  // ==========================================
  const config = await prisma.platformConfig.create({
    data: {
      commissionRate: 10.00,
      maintenanceMode: false,
      allowNewSignups: true,
    },
  })
  console.log('✅ Platform config criada:', config.id)

  // ==========================================
  // USUÁRIO ADMIN
  // ==========================================
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin HolosConnect',
      email: 'admin@holosconnect.com',
      password: await bcrypt.hash('Admin@123', 12),
      role: Role.ADMIN,
      active: true,
    },
  })
  console.log('✅ Admin criado:', adminUser.email)

  // ==========================================
  // TERAPEUTAS
  // ==========================================
  const therapistsData = [
    {
      name: 'Ana Clara Ribeiro',
      email: 'ana.ribeiro@holosconnect.com',
      bio: 'Terapeuta holística com 8 anos de experiência em Reiki e Meditação Guiada. Especializada em tratamento de ansiedade e burnout. Formada pelo Instituto Brasileiro de Terapias Integrativas.',
      therapies: ['Reiki', 'Meditação Guiada', 'Cristaloterapia'],
      price: 180.00,
      modality: Modality.AMBOS,
      location: 'São Paulo, SP',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.9,
      reviewCount: 47,
      yearsExp: 8,
      certifications: ['Reiki Mestre', 'Meditação Mindfulness', 'Cristaloterapia Avançada'],
    },
    {
      name: 'Carlos Eduardo Silva',
      email: 'carlos.silva@holosconnect.com',
      bio: 'Acupunturista e Terapeuta Ayurvédico com formação na China e na Índia. Especialista em dores crônicas e equilíbrio energético. Atendimento presencial em São Paulo.',
      therapies: ['Acupuntura', 'Ayurveda', 'Auriculoterapia'],
      price: 220.00,
      modality: Modality.PRESENCIAL,
      location: 'São Paulo, SP',
      city: 'São Paulo',
      state: 'SP',
      rating: 4.8,
      reviewCount: 63,
      yearsExp: 12,
      certifications: ['Acupuntura - Universidade de Pequim', 'Ayurveda Integral'],
    },
    {
      name: 'Fernanda Costa',
      email: 'fernanda.costa@holosconnect.com',
      bio: 'Psicóloga transpessoal e terapeuta holística. Trabalha com integração mente-corpo-espírito para auxiliar em processos de autoconhecimento, cura emocional e expansão de consciência.',
      therapies: ['Psicologia Transpessoal', 'Constelação Familiar', 'Hipnoterapia'],
      price: 250.00,
      modality: Modality.ONLINE,
      location: 'Online',
      city: 'Remoto',
      state: 'BR',
      rating: 5.0,
      reviewCount: 28,
      yearsExp: 6,
      certifications: ['CRP-06/12345', 'Constelação Familiar Sistêmica', 'Hipnoterapia Ericksoniana'],
    },
    {
      name: 'Roberto Matos',
      email: 'roberto.matos@holosconnect.com',
      bio: 'Terapeuta floral e fitoterapeuta com vasta experiência em tratamentos naturais. Utiliza florais de Bach e terapias complementares para equilíbrio emocional e físico.',
      therapies: ['Florais de Bach', 'Fitoterapia', 'Aromaterapia'],
      price: 150.00,
      modality: Modality.AMBOS,
      location: 'Rio de Janeiro, RJ',
      city: 'Rio de Janeiro',
      state: 'RJ',
      rating: 4.7,
      reviewCount: 35,
      yearsExp: 9,
      certifications: ['Florais de Bach Nível 3', 'Fitoterapia Funcional'],
    },
    {
      name: 'Juliana Alves',
      email: 'juliana.alves@holosconnect.com',
      bio: 'Yoga terapeuta e instrutora de meditação com formação na Índia (Rishikesh). Especialista em yoga para saúde, meditação vipassana e práticas de bem-estar integrativo.',
      therapies: ['Yoga Terapêutico', 'Meditação Vipassana', 'Pranayama'],
      price: 130.00,
      modality: Modality.AMBOS,
      location: 'Belo Horizonte, MG',
      city: 'Belo Horizonte',
      state: 'MG',
      rating: 4.9,
      reviewCount: 52,
      yearsExp: 10,
      certifications: ['RYT-500 Yoga Alliance', 'Vipassana 10-Day Retreat Teacher'],
    },
  ]

  for (const therapistData of therapistsData) {
    const { therapies, price, modality, location, city, state, bio, rating, reviewCount, yearsExp, certifications, ...userData } = therapistData

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: await bcrypt.hash('Terapeuta@123', 12),
        role: Role.TERAPEUTA,
        active: true,
        therapistProfile: {
          create: {
            bio,
            therapies,
            price,
            modality,
            location,
            city,
            state,
            rating,
            reviewCount,
            yearsExp,
            certifications,
            approved: true,
            availability: {
              createMany: {
                data: [
                  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 60 },
                  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', slotDuration: 60 },
                  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 60 },
                  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', slotDuration: 60 },
                  { dayOfWeek: 5, startTime: '09:00', endTime: '14:00', slotDuration: 60 },
                ],
              },
            },
          },
        },
      },
    })
    console.log('✅ Terapeuta criado:', user.email)
  }

  // ==========================================
  // PACIENTES
  // ==========================================
  const patientsData = [
    {
      name: 'Marcos Pereira',
      email: 'marcos.pereira@email.com',
      anamnese: {
        idade: 32,
        genero: Gender.MASCULINO,
        objetivo: 'Redução do estresse e ansiedade relacionados ao trabalho',
        historicoEmocional: 'Histórico de ansiedade generalizada, dificuldade de relaxar e insônia',
        medicamentos: 'Não utiliza medicamentos',
        preferencia: Modality.ONLINE,
        alergias: 'Nenhuma',
        condicoesCronicas: 'Nenhuma',
        expectativas: 'Encontrar equilíbrio emocional e melhorar qualidade do sono',
      },
    },
    {
      name: 'Patrícia Santos',
      email: 'patricia.santos@email.com',
      anamnese: {
        idade: 28,
        genero: Gender.FEMININO,
        objetivo: 'Autoconhecimento e desenvolvimento espiritual',
        historicoEmocional: 'Passando por transição de carreira, buscando clareza e propósito',
        medicamentos: 'Anticoncepcional',
        preferencia: Modality.PRESENCIAL,
        alergias: 'Nenhuma',
        condicoesCronicas: 'Nenhuma',
        expectativas: 'Maior clareza mental e conexão com propósito de vida',
      },
    },
    {
      name: 'Lucas Ferreira',
      email: 'lucas.ferreira@email.com',
      anamnese: {
        idade: 45,
        genero: Gender.MASCULINO,
        objetivo: 'Tratamento de dores crônicas nas costas',
        historicoEmocional: 'Frustrações acumuladas, irritabilidade',
        medicamentos: 'Anti-inflamatórios ocasionais',
        preferencia: Modality.PRESENCIAL,
        alergias: 'Nenhuma',
        condicoesCronicas: 'Hérnia de disco L4-L5',
        expectativas: 'Alívio das dores e melhoria da mobilidade',
      },
    },
  ]

  for (const patientData of patientsData) {
    const { anamnese, ...userData } = patientData
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: await bcrypt.hash('Paciente@123', 12),
        role: Role.PACIENTE,
        active: true,
        patientProfile: {
          create: {
            gender: Gender.MASCULINO,
            anamnese,
          },
        },
      },
    })
    console.log('✅ Paciente criado:', user.email)
  }

  // ==========================================
  // AGENDAMENTOS DE EXEMPLO
  // ==========================================
  const therapist = await prisma.therapistProfile.findFirst()
  const patient = await prisma.patientProfile.findFirst()

  if (therapist && patient) {
    const appointment = await prisma.appointment.create({
      data: {
        therapistId: therapist.id,
        patientId: patient.id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
        status: AppointmentStatus.CONFIRMADO,
        price: therapist.price,
        commissionRate: 10.00,
        commission: Number(therapist.price) * 0.10,
        therapistNet: Number(therapist.price) * 0.90,
        platformRevenue: Number(therapist.price) * 0.10,
        durationMinutes: 60,
      },
    })
    console.log('✅ Agendamento de exemplo criado:', appointment.id)

    // Agendamento concluído com avaliação
    const completedAppointment = await prisma.appointment.create({
      data: {
        therapistId: therapist.id,
        patientId: patient.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // -7 dias
        status: AppointmentStatus.CONCLUIDO,
        price: therapist.price,
        commissionRate: 10.00,
        commission: Number(therapist.price) * 0.10,
        therapistNet: Number(therapist.price) * 0.90,
        platformRevenue: Number(therapist.price) * 0.10,
        durationMinutes: 60,
      },
    })

    const therapistUser = await prisma.user.findUnique({ where: { id: therapist.userId } })
    const patientUser = await prisma.user.findUnique({ where: { id: patient.userId } })

    if (therapistUser && patientUser) {
      await prisma.review.create({
        data: {
          appointmentId: completedAppointment.id,
          therapistId: therapist.id,
          authorId: patientUser.id,
          rating: 5,
          comment: 'Sessão incrível! A terapeuta foi muito atenciosa e profissional. Já me sinto muito melhor após a primeira consulta.',
        },
      })
      console.log('✅ Avaliação de exemplo criada')

      // Notificação de boas-vindas para o admin
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: 'Bem-vindo ao HolosConnect Admin',
          message: 'O sistema foi configurado com sucesso. Os dados de seed estão disponíveis para testes.',
          type: 'SUCCESS',
        },
      })
    }
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('   Admin:     admin@holosconnect.com     | Admin@123')
  console.log('   Terapeuta: ana.ribeiro@holosconnect.com | Terapeuta@123')
  console.log('   Paciente:  marcos.pereira@email.com   | Paciente@123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
