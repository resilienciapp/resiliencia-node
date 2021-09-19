import {
  createStubSignInInput,
  createStubSignUpInput,
} from '__mocks__/support/user'
import { UserInputError } from 'apollo-server-express'
import { SignInInput, SignUpInput } from 'generated/graphql'

import { validateSignInFields, validateSignUpFields } from '.'

describe('validateSignInFields', () => {
  it('success case', () => {
    expect(validateSignInFields(createStubSignInInput())).toBeUndefined()
  })

  describe('error cases', () => {
    it('throws an error if the input has not the right format', () => {
      const badSignInInput: SignInInput = {
        email: 'email',
        password: 'password',
      }

      expect(() => validateSignInFields(badSignInInput)).toThrowError(
        new UserInputError('INVALID_FIELDS', {
          errors: ['INVALID_EMAIL', 'INVALID_PASSWORD'],
        }),
      )
    })
  })
})

describe('validateSignUpFields', () => {
  it('success case', () => {
    expect(validateSignUpFields(createStubSignUpInput())).toBeUndefined()
  })

  describe('error cases', () => {
    it('throws an error if the input has not the right format', () => {
      const badSignUpInput: SignUpInput = {
        email: 'email',
        name: 'name',
        password: 'password',
      }

      expect(() => validateSignUpFields(badSignUpInput)).toThrowError(
        new UserInputError('INVALID_FIELDS', {
          errors: ['INVALID_EMAIL', 'INVALID_PASSWORD'],
        }),
      )
    })
  })
})
