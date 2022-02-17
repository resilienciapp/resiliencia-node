import { Context, requireUser } from 'context'
import {
  getEvents,
  getProfile,
  getSubscriptions,
  requestMarkerAdministration,
  subscribeMarker,
  unsubscribeMarker,
} from 'domain/user'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    requestMarkerAdministration: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return requestMarkerAdministration(id, user)
    },
    subscribeMarker: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return subscribeMarker(id, user)
    },
    unsubscribeMarker: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return unsubscribeMarker(id, user)
    },
  },
  Query: {
    user: async (_, __, context) => {
      const { user } = await requireUser(context)

      return user
    },
  },
  User: {
    events: user => getEvents(user),
    profile: user => getProfile(user),
    subscriptions: user => getSubscriptions(user),
  },
}
