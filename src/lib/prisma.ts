import { PrismaClient } from '@prisma/client'

// Decisão arquitetural: Proxy lazy — o PrismaClient só é instanciado
// quando uma query é realmente executada (não no import do módulo).
// Isso resolve o erro de build no Vercel onde o Prisma tentava
// inicializar sem DATABASE_URL disponível durante a análise estática.

const globalForPrisma = globalThis as unknown as {
  _prismaClient: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma._prismaClient) {
    globalForPrisma._prismaClient = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma._prismaClient
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: string | symbol) {
    const client = getPrismaClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
