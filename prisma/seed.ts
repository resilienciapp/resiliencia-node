import { Category, PrismaClient, User } from '@prisma/client'

import { encrypt } from '../src/domain/crypto'

const prisma = new PrismaClient()

type Reduced<T> = Omit<T, 'created_at' | 'id' | 'updated_at'>

const seedCategories: Reduced<Category>[] = [
  {
    description: 'Entrega de comida.',
    name: 'Olla Popular',
  },
  {
    description:
      'Espacio al aire libre donde sentarse a comer, almorzar o merendar.',
    name: 'Merendero',
  },
  {
    description: 'Otro tipo de evento.',
    name: 'Otro',
  },
]

const seedUsers: Reduced<User>[] = [
  {
    email: 'joaquin.aguirre@fing.edu.uy',
    name: 'Joaquín Aguirre',
    password: encrypt('password'),
  },
  {
    email: 'maria.cecilia.pirotto@fing.edu.uy',
    name: 'María Cecilia Pirotto Silvotti',
    password: encrypt('password'),
  },
]

const seed = async () => {
  const categories = await prisma.$transaction(
    seedCategories.map(data => prisma.category.create({ data })),
  )
  console.log(categories)

  const users = await prisma.$transaction(
    seedUsers.map(data => prisma.user.create({ data })),
  )
  console.log(users)
}

seed()
  .catch(error => {
    console.error(error)
    throw error
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
