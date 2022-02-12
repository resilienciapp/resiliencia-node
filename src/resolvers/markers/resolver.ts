import { Context, isAuthenticatedUser, requireUser } from 'context'
import {
  addMarker,
  confirmMarker,
  deleteMarker,
  marker,
  markers,
} from 'domain/markers'
import { requests, subscribedUsers } from 'domain/requests'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Marker: {
    requests: marker => requests(marker),
    subscribedUsers: marker => subscribedUsers(marker),
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
    confirmMarker: async (_, { id }, context) => {
      await requireUser(context)

      return confirmMarker(id)
    },
    deleteMarker: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return deleteMarker(id, user)
    },
  },
  Query: {
    marker,
    markers,
  },
}
