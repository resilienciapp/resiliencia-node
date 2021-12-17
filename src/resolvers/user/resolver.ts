import { Context, requireUser } from 'context'
import {
  getEvents,
  getProfile,
  getSubscriptions,
  subscribeMarker,
  unsubscribeMarker,
} from 'domain/user'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    subscribeMarker: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      return subscribeMarker(input, user)
    },
    unsubscribeMarker: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      return unsubscribeMarker(input, user)
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
