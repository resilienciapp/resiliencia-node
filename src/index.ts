import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServer } from 'apollo-server-express'
import { context } from 'context'
import { logInfo } from 'domain/logger'
import { initializeFirebase } from 'domain/notification'
import express from 'express'
import { createServer } from 'http'
import { installLocalStorage } from 'localStorage'
import { plugins } from 'plugins'
import { resolvers, typeDefs } from 'resolvers'
import { format } from 'util'
import { validateEnvironment } from 'validateEnvironment'

const boot = async () => {
  validateEnvironment()

  const app = express()

  const schema = makeExecutableSchema({
    resolvers,
    typeDefs,
  })

  const apolloServer = new ApolloServer({
    context,
    plugins,
    schema,
  })

  await apolloServer.start()

  apolloServer.applyMiddleware({ app })

  const server = createServer(app)

  installLocalStorage()
  initializeFirebase()

  server.listen({ port: process.env.PORT }, () => {
    logInfo(
      format(
        '🚀 Server ready at http://localhost:%s%s',
        process.env.PORT,
        apolloServer.graphqlPath,
      ),
    )
  })
}

boot()
