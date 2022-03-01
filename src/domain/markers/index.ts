import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
  PrismaPromise,
  User,
} from '@prisma/client'
import { UserInputError } from 'apollo-server-errors'
import { addDays } from 'date-fns'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { Notification, sendNotifications } from 'domain/notification'
import { MinimumIdentifiableUser } from 'domain/user'
import {
  AddMarkerInput,
  Marker,
  QueryResolvers,
  RequestStatus,
  RespondMarkerRequestInput,
} from 'generated/graphql'
import { CacheKeyPrefix, del, delKey, get, keys, set } from 'localStorage'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableMarker = OptionalExceptFor<Marker, 'id'>

export const createMarker = (
  marker: DatabaseMarker & { category: DatabaseCategory },
): Marker => ({
  ...marker,
  adminRequests: [],
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
  addDays(date ?? new Date(), 7)

export const adminRequests = async (
  { id }: MinimumIdentifiableMarker,
  user: MinimumIdentifiableUser,
) => {
  const marker = await client().marker.findUnique({
    where: { id },
  })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (!marker.owners.find(owner => owner === user.id)) {
    return []
  }

  const requests = await client().administratorRequest.findMany({
    include: { user: true },
    where: { marker_id: id },
  })

  return requests.map(request => ({
    createdAt: request.created_at,
    id: request.id,
    status: request.status as RequestStatus,
    userName: request.user.name,
  }))
}

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

const MAXIMUM_REPORTS_NUMBER = 4
const SECONDS = 259200

export const reportMarker = async (
  id: number,
  user: MinimumIdentifiableUser,
) => {
  const [marker, reports, alreadyReported] = await Promise.all([
    client().marker.findUnique({ include: { category: true }, where: { id } }),
    get(CacheKeyPrefix.MARKER_REPORTS_AMOUNT, id),
    get(CacheKeyPrefix.USER_REPORT, id + ':' + user.id),
  ])

  const amountOfReports = Number(reports) + 1

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (marker.expires_at && marker.expires_at < new Date()) {
    throw new UserInputError('MARKER_ALREADY_EXPIRED')
  }

  if (alreadyReported) {
    throw new UserInputError('USER_ALREADY_REPORTED_MARKER')
  }

  if (MAXIMUM_REPORTS_NUMBER < amountOfReports) {
    try {
      await client().marker.update({
        data: { expires_at: new Date() },
        where: { id },
      })

      const userKeys = await keys(CacheKeyPrefix.USER_REPORT + id)

      await Promise.all([
        ...userKeys.map(key => delKey(key)),
        del(CacheKeyPrefix.MARKER_REPORTS_AMOUNT, id),
      ])
    } catch {
      throw new InternalError('ERROR_EXPIRING_MARKER')
    }
  } else {
    await Promise.all([
      set(CacheKeyPrefix.MARKER_REPORTS_AMOUNT, id, amountOfReports, SECONDS),
      set(CacheKeyPrefix.USER_REPORT, id + ':' + user.id, 1, SECONDS),
    ])
  }

  return markers()
}

export const respondMarkerRequest = async (
  input: RespondMarkerRequestInput,
  user: MinimumIdentifiableUser,
) => {
  const request = await client().administratorRequest.findUnique({
    where: { id: input.requestId },
  })

  if (!request) {
    throw new UserInputError('INVALID_REQUEST')
  }

  const marker = await client().marker.findUnique({
    where: { id: request.marker_id },
  })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (!marker.owners.find(owner => owner === user.id)) {
    throw new UserInputError('USER_NOT_ALLOWED_TO_PERFORM_OPERATION')
  }

  if (
    request.status !== RequestStatus.Pending ||
    input.response === RequestStatus.Pending
  ) {
    throw new UserInputError('INVALID_REQUEST_STATE')
  }

  const userToNotify = await client().user.findUnique({
    include: { device: true },
    where: { id: request.user_id },
  })

  if (!userToNotify) {
    throw new InternalError('INVALID_USER')
  }

  const isSubscribed = await client().subscription.findUnique({
    where: {
      user_id_marker_id: {
        marker_id: request.marker_id,
        user_id: request.user_id,
      },
    },
  })

  try {
    const transaction: PrismaPromise<unknown>[] = [
      client().administratorRequest.update({
        data: { status: input.response },
        where: { id: input.requestId },
      }),
      client().marker.update({
        data: { owners: { push: [request.user_id] } },
        where: { id: request.marker_id },
      }),
    ]

    if (isSubscribed) {
      transaction.push(
        client().subscription.delete({
          where: {
            user_id_marker_id: {
              marker_id: request.marker_id,
              user_id: request.user_id,
            },
          },
        }),
      )
    }

    await client().$transaction(transaction)

    await sendNotifications(
      [userToNotify],
      Notification.EVENT_ADMINISTRATION_RESPONSE,
      { markerId: marker.id.toString(), markerName: marker.name },
    )
  } catch {
    throw new InternalError('ERROR_UPDATING_MARKER_REQUEST')
  }

  return marker
}
