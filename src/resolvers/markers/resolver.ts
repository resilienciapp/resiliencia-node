import { Context, isAuthenticatedUser, requireUser } from 'context'
import {
  addMarker,
  adminRequests,
  confirmMarker,
  deleteMarker,
  marker,
  markers,
  reportMarker,
  respondMarkerRequest,
} from 'domain/markers'
import { requests, subscribedUsers } from 'domain/requests'
import { validateAddMarkerFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Marker: {
    adminRequests: async (marker, _, context) => {
      try {
        const { user } = await requireUser(context)
        return adminRequests(marker, user)
      } catch {
        return []
      }
    },
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
    confirmMarker: async (_, { id }) => {
      return confirmMarker(id)
    },
    deleteMarker: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return deleteMarker(id, user)
    },
    reportMarker: async (_, { id }, context) => {
      const { user } = await requireUser(context)

      return reportMarker(id, user)
    },
    respondMarkerRequest: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      return respondMarkerRequest(input, user)
    },
  },
  Query: {
    marker,
    markers,
  },
}
