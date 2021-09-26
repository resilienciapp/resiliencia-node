import { Context, requireUser } from 'context'
import { addMarker, markers } from 'domain/markers'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    addMarker: async (_, { input }, context) => {
      await requireUser(context)
      validateAddMarkerFields(input)

      return addMarker(input)
    },
  },
  Query: {
    markers,
  },
}
