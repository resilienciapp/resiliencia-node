import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  User,
} from '@prisma/client'
import { UserInputError } from 'apollo-server-express'
import { addDays } from 'date-fns'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import {
  AddMarkerInput,
  ConfirmMarkerInput,
  Marker,
  QueryResolvers,
} from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableMarker = OptionalExceptFor<Marker, 'id'>

export const createMarker = (
  marker: DatabaseMarker & { category: DatabaseCategory },
): Marker => ({
  ...marker,
  expiresAt: marker.expires_at,
  requests: [],
  timeZone: marker.time_zone,
})

export const marker: QueryResolvers['marker'] = async (_, { id }) => {
  const marker = await client().marker.findUnique({
    include: { category: true },
    where: { id },
  })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  return createMarker(marker)
}

export const markers = async () => {
  const markers = await client().marker.findMany({
    include: { category: true },
    where: {
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
  })

  return markers.map(createMarker)
}

const extendMarkerExpiration = (date?: Date | null) =>
  addDays(date ?? new Date(), 14)

export const addMarker = async (
  fields: AddMarkerInput,
  owners: User['id'][],
) => {
  try {
    await client().marker.create({
      data: {
        category_id: fields.category,
        description: fields.description,
        duration: fields.duration,
        expires_at: extendMarkerExpiration(fields.expiresAt),
        latitude: fields.latitude,
        longitude: fields.longitude,
        name: fields.name,
        owners,
        recurrence: fields.recurrence,
        time_zone: fields.timeZone,
      },
    })
  } catch {
    throw new InternalError('ERROR_ADDING_MARKER')
  }

  return markers()
}

export const confirmMarker = async (fields: ConfirmMarkerInput) => {
  const marker = await client().marker.findUnique({
    where: { id: fields.marker },
  })

  if (!marker) {
    throw new InternalError('INVALID_MARKER')
  }

  try {
    await client().marker.update({
      data: { expires_at: extendMarkerExpiration(marker.expires_at) },
      where: { id: fields.marker },
    })
  } catch {
    throw new InternalError('ERROR_CONFIRMING_MARKER')
  }

  return markers()
}
