import {
  Category,
  Marker,
  Subscription as DatabaseSubscription,
  User as DatabaseUser,
} from '@prisma/client'
import { UserInputError } from 'apollo-server-express'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { createMarker } from 'domain/markers'
import {
  Profile,
  SubscribeMarkerInput,
  Subscription,
  UnsubscribeMarkerInput,
  User,
} from 'generated/graphql'
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

export const subscribeMarker = async (
  input: SubscribeMarkerInput,
  user: DatabaseUser,
) => {
  const subscription = await client().subscription.findUnique({
    where: {
      user_id_marker_id: {
        marker_id: input.marker,
        user_id: user.id,
      },
    },
  })

  const marker = await client().marker.findUnique({
    where: { id: input.marker },
  })

  if (!marker) {
    throw new InternalError('ERROR_SUBSCRIBING_MARKER')
  }

  if (marker.owners.find(owner => owner === user.id)) {
    throw new InternalError('CAN_NOT_SUBSCRIBE_OWN_EVENT')
  }

  if (!subscription) {
    try {
      await client().subscription.create({
        data: {
          marker_id: input.marker,
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
  input: UnsubscribeMarkerInput,
  user: DatabaseUser,
) => {
  const subscription = await client().subscription.findUnique({
    where: {
      user_id_marker_id: {
        marker_id: input.marker,
        user_id: user.id,
      },
    },
  })

  if (subscription) {
    try {
      await client().subscription.delete({
        where: {
          user_id_marker_id: {
            marker_id: input.marker,
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
