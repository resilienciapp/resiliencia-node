import { UserInputError } from 'apollo-server-errors'
import { SignInInput, SignUpInput } from 'generated/graphql'

import { validator } from './validator'

const compactValidations = (errors: (string | undefined)[]) => {
  if (errors.filter(Boolean).length > 0) {
    throw new UserInputError('INVALID_FIELDS', { errors })
  }
}

export const validateSignInFields = (fields: SignInInput) => {
  compactValidations([
    validator.email(fields.email),
    validator.password(fields.password),
  ])
}

export const validateSignUpFields = (fields: SignUpInput) => {
  compactValidations([
    validator.email(fields.email),
    validator.name(fields.name),
    validator.password(fields.password),
  ])
}
