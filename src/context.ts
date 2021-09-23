import { AuthenticationError } from 'apollo-server-errors'
import { ExpressContext } from 'apollo-server-express'
import { client } from 'db'
import { Scope } from 'domain/session'
import { decode, Jwt, verify } from 'jsonwebtoken'

export type Context = Jwt | Partial<Jwt>

export const context = ({ req }: ExpressContext): Context => {
  try {
    const token = req.headers.authorization

    if (!token) {
      return {}
    }

    verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS512'],
    })

    return decode(token, { complete: true }) ?? {}
  } catch {
    throw new AuthenticationError('UNAUTHORIZED')
  }
}

export const requireUser = async (context: Context) => {
  if (!context.payload || !context.payload.sub) {
    throw new AuthenticationError('UNAUTHORIZED')
  }

  if (!context.payload.scope.find((scope: string) => scope === Scope.USER)) {
    throw new AuthenticationError('UNAUTHORIZED')
  }

  const user = await client().user.findUnique({
    where: { id: Number(context.payload.sub) },
  })

  if (!user) {
    throw new AuthenticationError('UNAUTHORIZED')
  }

  return { user }
}
