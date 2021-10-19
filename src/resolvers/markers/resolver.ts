import { Context, isAuthenticatedUser, requireUser } from 'context'
import { addMarker, confirmMarker, isSubscribed, markers } from 'domain/markers'
import { requests } from 'domain/requests'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Marker: {
    isSubscribed: async (marker, _, context) => {
      if (isAuthenticatedUser(context)) {
        const { user } = await requireUser(context)
        return isSubscribed(marker, user)
      }

      return false
    },
    requests: marker => requests(marker),
  },
  Mutation: {
    addMarker: async (_, { input }, context) => {
      const usersId = []

      if (isAuthenticatedUser(context)) {
        const { user } = await requireUser(context)
        usersId.push(user.id)
      }

      validateAddMarkerFields(input)

      return addMarker(input, usersId)
    },
    confirmMarker: async (_, { input }, context) => {
      await requireUser(context)

      return confirmMarker(input)
    },
  },
  Query: {
    markers,
  },
}
