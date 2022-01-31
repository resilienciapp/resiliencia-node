import { Context, requireUser } from 'context'
import { addRequest } from 'domain/requests'
import { validateRequestFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    addRequest: async (_, { input }, context) => {
      const { user } = await requireUser(context)

      validateRequestFields(input)

      return addRequest(input, user)
    },
  },
}
