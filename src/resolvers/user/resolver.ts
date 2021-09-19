import { Context, requireUser } from 'context'
import { getProfile } from 'domain/user'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Query: {
    user: async (_, __, context) => {
      const { user } = await requireUser(context)

      return user
    },
  },
  User: {
    profile: user => getProfile(user),
  },
}
