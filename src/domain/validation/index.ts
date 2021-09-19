import { UserInputError } from 'apollo-server-errors'
import { isEmail } from 'class-validator'
import { SignUpInput } from 'generated/graphql'

export const validateSignUpFields = (fields: SignUpInput) => {
  const errors = []

  if (!isEmail(fields.email)) {
    errors.push('INVALID_EMAIL')
  }

  if (errors.length > 0) {
    throw new UserInputError('INVALID_FIELDS', { errors })
  }
}
