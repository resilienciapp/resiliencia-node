import { Context } from 'context'
import { signIn, signUp } from 'domain/session'
import { validateSignInFields, validateSignUpFields } from 'domain/validation'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Mutation: {
    signIn: (_, { input }) => {
      validateSignInFields(input)

      return signIn(input)
    },
    signUp: (_, { input }) => {
      validateSignUpFields(input)

      return signUp(input)
    },
  },
}
