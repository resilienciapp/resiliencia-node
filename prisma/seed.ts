import { PrismaClient, User } from '@prisma/client'

import { encrypt } from '../src/domain/crypto'

const prisma = new PrismaClient()

type Reduced<T> = Omit<T, 'created_at' | 'id' | 'updated_at'>

type SeedUser = Reduced<User>

const seedUsers: SeedUser[] = [
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
  const users = await prisma.$transaction(
    seedUsers.map(seedUser =>
      prisma.user.create({
        data: seedUser,
      }),
    ),
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
