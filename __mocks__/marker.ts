import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  Subscription as DatabaseSubscription,
} from '@prisma/client'
import { AddMarkerInput } from 'generated/graphql'

import { createStubCategory } from './category'

type Marker = DatabaseMarker & {
  category?: DatabaseCategory
  subscription?: DatabaseSubscription[]
}

export const createStubMarker = (opts?: Partial<Marker>): Marker => ({
  category: createStubCategory(),
  category_id: 1,
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  description: 'Vení y llevate un plato de comida caliente.',
  duration: 180,
  expires_at: null,
  id: 1,
  latitude: -34.895365,
  longitude: -56.18769,
  name: 'Residencia Universitaria Sagrada Familia',
  owners: [],
  recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
  time_zone: 'America/Montevideo',
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  ...opts,
})

export const createStubAddMarkerInput = (
  opts?: Partial<AddMarkerInput>,
): AddMarkerInput => ({
  category: 1,
  description: 'Vení y llevate un plato de comida caliente.',
  duration: 180,
  expiresAt: null,
  latitude: -34.895365,
  longitude: -56.18769,
  name: 'Residencia Universitaria Sagrada Familia',
  recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
  timeZone: 'America/Montevideo',
  ...opts,
})
