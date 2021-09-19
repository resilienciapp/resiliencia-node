import { User } from '@prisma/client'
import { SignInInput, SignUpInput } from 'generated/graphql'

export const createStubUser = (opts?: Partial<User>): User => ({
  created_at: new Date(2000, 5, 25),
  email: 'joaquin.aguirre@fing.edu.uy',
  id: 1,
  name: 'Joaquín Aguirre',
  password: 'encryptedPassword',
  updated_at: new Date(2000, 5, 25),
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
