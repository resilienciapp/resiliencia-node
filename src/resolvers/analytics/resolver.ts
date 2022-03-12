import { Context } from 'context'
import { markersAnalytics } from 'domain/analytics'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers<Context> = {
  Query: {
    markersAnalytics,
  },
}
