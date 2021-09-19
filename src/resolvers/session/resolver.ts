import { Context } from 'context'
import { createAccount } from 'domain/session'
import { validateSignUpFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    signUp: (_, { input }) => {
      validateSignUpFields(input)

      return createAccount(input)
    },
  },
}
