import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  User,
} from '@prisma/client'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { AddMarkerInput, Marker } from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableMarker = OptionalExceptFor<Marker, 'id'>

export const createMarker = (
  marker: DatabaseMarker & { category: DatabaseCategory },
): Marker => ({
  ...marker,
  expiresAt: marker.expires_at,
  requests: [],
})

export const markers = async () => {
  const markers = await client().marker.findMany({
    include: { category: true },
    where: {
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
  })

  return markers.map(createMarker)
}

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
        expires_at: fields.expiresAt,
        latitude: fields.latitude,
        longitude: fields.longitude,
        name: fields.name,
        owners,
        recurrence: fields.recurrence,
      },
    })
  } catch {
    throw new InternalError('ERROR_ADDING_MARKER')
  }

  return markers()
}
