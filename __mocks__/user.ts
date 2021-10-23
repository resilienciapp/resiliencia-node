import { Device as DatabaseDevice, User as DatabaseUser } from '@prisma/client'
import { SignInInput, SignUpInput } from 'generated/graphql'

type User = DatabaseUser & {
  device?: DatabaseDevice[]
}

export const createStubUser = (opts?: Partial<User>): User => ({
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  email: 'joaquin.aguirre@fing.edu.uy',
  id: 1,
  name: 'Joaquín Aguirre',
  password: 'encryptedPassword',
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  ...opts,
})

export const createStubSignInInput = (
  opts?: Partial<SignInInput>,
): SignInInput => ({
  email: 'joaquin.aguirre@fing.edu.uy',
  password: 'P4ssw*rd',
  ...opts,
})

export const createStubSignUpInput = (
  opts?: Partial<SignUpInput>,
): SignUpInput => ({
  email: 'joaquin.aguirre@fing.edu.uy',
  name: 'Joaquín Aguirre',
  password: 'P4ssw*rd',
  ...opts,
})
