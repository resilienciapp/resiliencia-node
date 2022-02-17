import {
  Category,
  Marker,
  RequestStatus,
  Subscription as DatabaseSubscription,
  User as DatabaseUser,
} from '@prisma/client'
import { UserInputError } from 'apollo-server-errors'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { createMarker } from 'domain/markers'
import { Notification, sendNotifications } from 'domain/notification'
import { Profile, Subscription, User } from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableUser = OptionalExceptFor<User, 'id'>

const createProfile = (user: DatabaseUser): Profile => ({
  email: user.email,
  name: user.name,
})

export const getProfile = async ({ id }: MinimumIdentifiableUser) => {
  const user = await client().user.findUnique({
    where: { id },
  })

  if (!user) {
    throw new UserInputError('INVALID_USER')
  }

  return createProfile(user)
}

const createSubscription = (
  marker: Marker & {
    category: Category
    subscription: DatabaseSubscription[]
  },
  userId: number,
): Subscription => {
  const subscription = marker.subscription.find(
    ({ user_id }) => user_id === userId,
  )

  if (!subscription) {
    throw new InternalError('ERROR_FORMATTING_SUBSCRIPTION')
  }

  return {
    date: subscription.created_at,
    id: subscription.id,
    marker: createMarker(marker),
  }
}

const createEvent = (marker: Marker & { category: Category }) => ({
  marker: createMarker(marker),
})

export const getEvents = async ({ id }: MinimumIdentifiableUser) => {
  const markers = await client().marker.findMany({
    include: { category: true },
    where: { owners: { has: id } },
  })

  return markers.map(createEvent)
}

export const getSubscriptions = async ({ id }: MinimumIdentifiableUser) => {
  const markers = await client().marker.findMany({
    include: { category: true, subscription: true },
    where: { subscription: { some: { user_id: id } } },
  })

  return markers.map(_ => createSubscription(_, id))
}

export const requestMarkerAdministration = async (
  markerId: number,
  user: DatabaseUser,
) => {
  const marker = await client().marker.findUnique({
    where: { id: markerId },
  })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (marker.owners.find(owner => owner === user.id)) {
    throw new UserInputError('ALREADY_AN_ADMINISTRATOR')
  }

  const request = await client().administratorRequest.findUnique({
    where: { user_id_marker_id: { marker_id: markerId, user_id: user.id } },
  })

  if (request) {
    throw new UserInputError('ALREADY_REQUESTED_ADMINISTRATION')
  }

  if (marker.owners.length === 0) {
    try {
      await client().$transaction([
        client().administratorRequest.create({
          data: {
            marker_id: markerId,
            status: RequestStatus.accepted,
            user_id: user.id,
          },
        }),
        client().marker.update({
          data: { owners: [user.id] },
          where: { id: markerId },
        }),
      ])
    } catch {
      throw new InternalError('ERROR_REQUESTING_MARKER_ADMINISTRATION')
    }
  }

  if (marker.owners.length !== 0) {
    try {
      const owners = await client().user.findMany({
        include: { device: true },
        where: { id: { in: marker.owners } },
      })

      await Promise.all([
        client().administratorRequest.create({
          data: {
            marker_id: markerId,
            status: RequestStatus.pending,
            user_id: user.id,
          },
        }),
        sendNotifications(owners, Notification.EVENT_ADMINISTRATION_REQUEST, {
          markerId: marker.id.toString(),
          markerName: marker.name,
        }),
      ])
    } catch {
      throw new InternalError('ERROR_REQUESTING_MARKER_ADMINISTRATION')
    }
  }

  return user
}

export const subscribeMarker = async (markerId: number, user: DatabaseUser) => {
  const subscription = await client().subscription.findUnique({
    where: {
      user_id_marker_id: {
        marker_id: markerId,
        user_id: user.id,
      },
    },
  })

  const marker = await client().marker.findUnique({
    where: { id: markerId },
  })

  if (!marker) {
    throw new UserInputError('INVALID_MARKER')
  }

  if (marker.expires_at && marker.expires_at < new Date()) {
    throw new UserInputError('CAN_NOT_SUBSCRIBE_EXPIRED_MARKER')
  }

  if (marker.owners.find(owner => owner === user.id)) {
    throw new UserInputError('CAN_NOT_SUBSCRIBE_OWN_MARKER')
  }

  if (!subscription) {
    try {
      await client().subscription.create({
        data: {
          marker_id: markerId,
          user_id: user.id,
        },
      })
    } catch {
      throw new InternalError('ERROR_SUBSCRIBING_MARKER')
    }
  }

  return user
}

export const unsubscribeMarker = async (
  markerId: number,
  user: DatabaseUser,
) => {
  const subscription = await client().subscription.findUnique({
    where: {
      user_id_marker_id: {
        marker_id: markerId,
        user_id: user.id,
      },
    },
  })

  if (subscription) {
    try {
      await client().subscription.delete({
        where: {
          user_id_marker_id: {
            marker_id: markerId,
            user_id: user.id,
          },
        },
      })
    } catch {
      throw new InternalError('ERROR_UNSUBSCRIBING_MARKER')
    }
  }

  return user
}
