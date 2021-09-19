import { Scope } from 'context'
import { client } from 'db'
import { encrypt } from 'domain/crypto'
import { InternalError } from 'domain/errors'
import { SignUpInput } from 'generated/graphql'
import { sign } from 'jsonwebtoken'

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

export const createAccount = async (fields: SignUpInput) => {
  try {
    const user = await client().user.create({
      data: {
        email: fields.email,
        name: fields.name,
        password: encrypt(fields.password),
      },
    })

    return generateToken(user.id.toString(), [Scope.USER], TokenTime.USER)
  } catch (_error) {
    throw new InternalError('ERROR_CREATING_USER')
  }
}
