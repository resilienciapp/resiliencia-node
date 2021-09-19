import { PluginDefinition } from 'apollo-server-core'
import { Context } from 'context'
import { logError, logInfo } from 'domain/logger'

const formatContext = (context: Context) => {
  if (context.payload) {
    return {
      expiration: context.payload.exp,
      scopes: context.payload.scope,
      subject: context.payload.sub,
    }
  }
}

export const plugins: PluginDefinition[] = [
  {
    requestDidStart: async ({ context }) => ({
      didEncounterErrors: async ({ errors }) => {
        errors.forEach(error => {
          logError({
            error,
            ...formatContext(context),
          })
        })
      },
      didResolveOperation: async ({ operation }) => {
        logInfo({
          operation,
          ...formatContext(context),
        })
      },
    }),
  },
]
