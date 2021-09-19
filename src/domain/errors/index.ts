import { ApolloError } from 'apollo-server-express'

export class InternalError extends ApolloError {
  constructor(message: string, properties?: Record<string, string>) {
    super(message, 'INTERNAL_SERVER_ERROR', properties)

    Object.defineProperty(this, 'name', { value: 'InternalError' })
  }
}
