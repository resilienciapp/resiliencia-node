import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  User,
} from '@prisma/client'
import { UserInputError } from 'apollo-server-express'
import { addDays } from 'date-fns'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { MinimumIdentifiableUser } from 'domain/user'
import { AddMarkerInput, Marker, QueryResolvers } from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableMarker = OptionalExceptFor<Marker, 'id'>

export const createMarker = (
  marker: DatabaseMarker & { category: DatabaseCategory },
): Marker => ({
  ...marker,
  expiresAt: marker.expires_at,
  requests: [],
  subscribedUsers: 0,
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
    const newMarker = await client().marker.create({
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
      include: { category: true },
    })

    return createMarker(newMarker)
  } catch {
    throw new InternalError('ERROR_ADDING_MARKER')
  }
}

export const confirmMarker = async (id: number) => {
  const marker = await client().marker.findUnique({ where: { id } })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  try {
    const updatedMarker = await client().marker.update({
      data: { expires_at: extendMarkerExpiration(marker.expires_at) },
      include: { category: true },
      where: { id },
    })

    return createMarker(updatedMarker)
  } catch {
    throw new InternalError('ERROR_CONFIRMING_MARKER')
  }
}

export const deleteMarker = async (
  id: number,
  user: MinimumIdentifiableUser,
) => {
  const marker = await client().marker.findUnique({ where: { id } })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (!marker.owners.find(owner => owner === user.id)) {
    throw new UserInputError('INVALID_ACTION')
  }

  try {
    await client().marker.delete({ where: { id } })
  } catch {
    throw new InternalError('ERROR_DELETING_MARKER')
  }

  return markers()
}
