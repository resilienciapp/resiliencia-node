import { User as DatabaseUser } from '@prisma/client'
import { UserInputError } from 'apollo-server-express'
import { client } from 'db'
import { Profile, User } from 'generated/graphql'
import { OptionalExceptFor } from 'types'

export type MinimumIdentifiableUser = OptionalExceptFor<User, 'id'>

const createProfile = (user: DatabaseUser): Profile => ({
  email: user.email,
  name: user.name,
})

export const getProfile = async ({ id }: MinimumIdentifiableUser) => {
  const user = await client().user.findUnique({
    where: { id },
  })

  if (!user) {
    throw new UserInputError('INVALID_USER')
  }

  return createProfile(user)
}
