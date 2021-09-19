import { categories } from 'domain/categories'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers = {
  Query: {
    categories,
  },
}
