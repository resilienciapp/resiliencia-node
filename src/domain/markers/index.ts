import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  User,
} from '@prisma/client'
import { subDays } from 'date-fns'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import {
  AddMarkerInput,
  ConfirmMarkerInput,
  Marker,
  MarkerState,
} from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableMarker = OptionalExceptFor<Marker, 'id'>

const getMarkerState = (date: Date) => {
  if (subDays(new Date(), 30) < date) {
    return MarkerState.Active
  }

  if (subDays(new Date(), 60) < date) {
    return MarkerState.PendingConfirmation
  }

  return MarkerState.Inactive
}

export const createMarker = (
  marker: DatabaseMarker & { category: DatabaseCategory },
): Marker => ({
  ...marker,
  expiresAt: marker.expires_at,
  requests: [],
  state: getMarkerState(marker.confirmed_at),
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

export const confirmMarker = async (fields: ConfirmMarkerInput) => {
  const marker = await client().marker.findUnique({
    where: { id: fields.marker },
  })

  if (!marker || (marker.expires_at && marker.expires_at < new Date())) {
    throw new InternalError('INVALID_MARKER')
  }

  try {
    await client().marker.update({
      data: { confirmed_at: new Date() },
      where: { id: fields.marker },
    })
  } catch {
    throw new InternalError('ERROR_CONFIRMING_MARKER')
  }

  return markers()
}
