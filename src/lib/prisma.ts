import { PrismaClient } from '@prisma/client'

// Decisão arquitetural: Singleton pattern para evitar múltiplas instâncias
// do PrismaClient em ambiente de desenvolvimento com hot-reload do Next.js.
// Em produção, uma única instância é criada.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
