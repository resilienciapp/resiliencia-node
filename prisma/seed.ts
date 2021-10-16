import {
  Category,
  Marker,
  PrismaClient,
  Request,
  Subscription,
  User,
} from '@prisma/client'
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
    owners: [1],
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
    owners: [],
    recurrence: 'RRULE:FREQ=DAILY;BYDAY=SA,SU;BYHOUR=17',
  },
]

const seedRequests: Reduced<Request>[] = [
  {
    description:
      'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
    expires_at: null,
    marker_id: 1,
    notifiable: true,
    user_id: 1,
  },
  {
    description: '¡Necesitamos pollo!',
    expires_at: addDays(new Date(), 5),
    marker_id: 1,
    notifiable: false,
    user_id: 1,
  },
]

const seedSubscriptions: Reduced<Subscription>[] = [
  {
    marker_id: 1,
    user_id: 1,
  },
  {
    marker_id: 2,
    user_id: 1,
  },
  {
    marker_id: 1,
    user_id: 2,
  },
]

const seedUsers: Reduced<User>[] = [
  {
    email: 'joaquin.aguirre@fing.edu.uy',
    name: 'Joaquín Aguirre',
    password: encrypt('P4ssw*rd'),
  },
  {
    email: 'maria.cecilia.pirotto@fing.edu.uy',
    name: 'María Cecilia Pirotto Silvotti',
    password: encrypt('P4ssw*rd'),
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

  const subscriptions = await prisma.$transaction(
    seedSubscriptions.map(data => prisma.subscription.create({ data })),
  )
  console.log(subscriptions)

  const requests = await prisma.$transaction(
    seedRequests.map(data => prisma.request.create({ data })),
  )
  console.log(requests)
}

seed().finally(() => prisma.$disconnect())
