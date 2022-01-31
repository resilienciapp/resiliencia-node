import { Context, isAuthenticatedUser, requireUser } from 'context'
import { addMarker, confirmMarker, marker, markers } from 'domain/markers'
import { requests } from 'domain/requests'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Marker: {
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
    marker,
    markers,
  },
}
