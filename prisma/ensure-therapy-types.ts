import { PrismaClient } from '@prisma/client'
import { SEED_THERAPY_TYPE_NAMES } from '../src/constants/therapies'

const prisma = new PrismaClient()

function slugify(raw: string): string {
  return (
    raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'terapia'
  )
}

async function main() {
  for (let i = 0; i < SEED_THERAPY_TYPE_NAMES.length; i++) {
    const name = SEED_THERAPY_TYPE_NAMES[i]
    const existing = await prisma.therapyType.findUnique({ where: { name } })
    if (existing) continue

    const base = slugify(name)
    let slug = base
    let n = 0
    while (await prisma.therapyType.findUnique({ where: { slug } })) {
      n += 1
      slug = `${base}-${n}`
    }

    await prisma.therapyType.create({
      data: { name, slug, sortOrder: i, active: true },
    })
    console.log('Criado:', name)
  }

  console.log(
    'Catálogo padrão verificado:',
    SEED_THERAPY_TYPE_NAMES.length,
    'tipos (faltantes foram criados).'
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
