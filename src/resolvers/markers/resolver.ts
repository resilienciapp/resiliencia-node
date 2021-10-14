import { Context, isAuthenticatedUser, requireUser } from 'context'
import { addMarker, markers } from 'domain/markers'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
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
  },
  Query: {
    markers,
  },
}
