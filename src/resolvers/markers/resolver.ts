import { Context } from 'context'
import { markers } from 'domain/markers'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Query: {
    markers,
  },
}
