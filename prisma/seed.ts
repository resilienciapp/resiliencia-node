import { Category, Marker, PrismaClient, User } from '@prisma/client'
import { addDays } from 'date-fns'

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

const seedMarkers: Reduced<Marker>[] = [
  {
    category_id: 1,
    description: 'Vení y llevate un plato de comida caliente.',
    duration: 180,
    expires_at: null,
    latitude: -34.895365,
    longitude: -56.18769,
    name: 'Residencia Universitaria Sagrada Familia',
    recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
  },
  {
    category_id: 2,
    description: 'Espacio para merendar y conversar.',
    duration: 120,
    expires_at: addDays(new Date(), 10),
    latitude: -34.90578,
    longitude: -56.191679,
    name: 'Plaza Cagancha',
    recurrence: 'RRULE:FREQ=DAILY;BYDAY=SA,SU;BYHOUR=17',
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

  const markers = await prisma.$transaction(
    seedMarkers.map(data => prisma.marker.create({ data })),
  )
  console.log(markers)

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
