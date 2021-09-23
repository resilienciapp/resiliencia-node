import { UserInputError } from 'apollo-server-express'
import { client } from 'db'
import { encrypt } from 'domain/crypto'
import { InternalError } from 'domain/errors'
import { SignInInput, SignUpInput } from 'generated/graphql'
import { sign } from 'jsonwebtoken'

export enum Scope {
  USER = 'USER',
}

enum TokenTime {
  USER = '365 days',
}

const generateToken = (
  sub: string,
  scope: Scope[],
  expiresIn: string,
  opts?: object,
) => ({
  jwt: sign(
    {
      scope,
      sub,
      ...opts,
    },
    process.env.JWT_PRIVATE_KEY,
    {
      algorithm: 'RS512',
      expiresIn,
    },
  ),
})

export const signIn = async (fields: SignInInput) => {
  const user = await client().user.findUnique({
    where: { email: fields.email },
  })

  if (!user) {
    throw new UserInputError('INVALID_CREDENTIALS')
  }

  if (user.password !== encrypt(fields.password)) {
    throw new UserInputError('INVALID_CREDENTIALS')
  }

  return generateToken(user.id.toString(), [Scope.USER], TokenTime.USER)
}

export const signUp = async (fields: SignUpInput) => {
  try {
    const user = await client().user.create({
      data: {
        email: fields.email,
        name: fields.name,
        password: encrypt(fields.password),
      },
    })

    return generateToken(user.id.toString(), [Scope.USER], TokenTime.USER)
  } catch {
    throw new InternalError('ERROR_CREATING_USER')
  }
}
