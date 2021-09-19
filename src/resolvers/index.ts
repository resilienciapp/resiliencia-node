import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'
import { IResolvers } from '@graphql-tools/utils'

export const resolvers = mergeResolvers(
  loadFilesSync<IResolvers>('./src/resolvers/**/*resolver.ts'),
)

export const typeDefs = mergeTypeDefs(loadFilesSync('./src/**/*.gql'))
