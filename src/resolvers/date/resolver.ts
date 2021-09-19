import { date } from 'domain/date'
import { Resolvers } from 'generated/graphql'

export const resolvers: Resolvers = {
  Date: date,
}
