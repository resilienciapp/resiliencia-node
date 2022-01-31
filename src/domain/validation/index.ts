import { UserInputError } from 'apollo-server-errors'
import {
  AddMarkerInput,
  AddRequestInput,
  SignInInput,
  SignUpInput,
} from 'generated/graphql'

import { validator } from './validator'

const compactValidations = (validations: (string | undefined)[]) => {
  const errors = validations.filter(Boolean)

  if (0 < errors.length) {
    throw new UserInputError('INVALID_FIELDS', { errors })
  }
}

export const validateAddMarkerFields = (fields: AddMarkerInput) => {
  compactValidations([
    validator.duration(fields.duration),
    validator.name(fields.name),
    validator.recurrence(fields.recurrence),
  ])
}

export const validateRequestFields = (fields: AddRequestInput) => {
  compactValidations([validator.name(fields.description)])
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
