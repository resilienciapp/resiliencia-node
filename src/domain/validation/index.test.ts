import { createStubSignUpInput } from '__mocks__/support/user'
import { UserInputError } from 'apollo-server-express'
import { SignUpInput } from 'generated/graphql'

import { validateSignUpFields } from '.'

const signUpInput = createStubSignUpInput()

describe('validateSignUpFields', () => {
  it('success case', () => {
    expect(validateSignUpFields(signUpInput)).toBeUndefined()
  })

  describe('error cases', () => {
    it('throws an error if the email is not on the right format', () => {
      const badSignUpInput: SignUpInput = {
        ...signUpInput,
        email: 'email',
      }

      expect(() => validateSignUpFields(badSignUpInput)).toThrowError(
        new UserInputError('INVALID_FIELDS', {
          errors: ['INVALID_EMAIL'],
        }),
      )
    })
  })
})
