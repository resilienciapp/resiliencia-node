import { Context, requireUser } from 'context'
import {
  appVersion,
  registerDeviceToken,
  unregisterDeviceToken,
} from 'domain/device'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    registerDeviceToken: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      return registerDeviceToken(input, user)
    },
    unregisterDeviceToken: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      return unregisterDeviceToken(input, user)
    },
  },
  Query: {
    appVersion,
  },
}
