import { createStubAddMarkerInput } from '__mocks__/marker'
import { createStubSignInInput, createStubSignUpInput } from '__mocks__/user'
import { UserInputError } from 'apollo-server-errors'
import MockDate from 'mockdate'

import {
  validateAddMarkerFields,
  validateSignInFields,
  validateSignUpFields,
} from '.'

describe('validateAddMarkerFields', () => {
  it('success case', () => {
    expect(validateAddMarkerFields(createStubAddMarkerInput())).toBeUndefined()
  })

  describe('error cases', () => {
    beforeEach(() => {
      MockDate.set(new Date('2000-05-20T00:00:00.000Z'))
    })

    afterEach(() => {
      MockDate.reset()
    })

    it('throws an error if the input has not the right format', () => {
      expect(() =>
        validateAddMarkerFields(
          createStubAddMarkerInput({
            duration: 0,
            name: undefined,
            recurrence: 'DTSTART:20000101T000000Z\nRRULE:FREQ=MONTHLY;COUNT=1',
          }),
        ),
      ).toThrowError(
        new UserInputError('INVALID_FIELDS', {
          errors: ['INVALID_DURATION', 'INVALID_NAME', 'INVALID_RECURRENCE'],
        }),
      )
    })
  })
})

describe('validateSignInFields', () => {
  it('success case', () => {
    expect(validateSignInFields(createStubSignInInput())).toBeUndefined()
  })

  describe('error cases', () => {
    it('throws an error if the input has not the right format', () => {
      expect(() =>
        validateSignInFields(
          createStubSignInInput({
            email: 'email',
            password: 'password',
          }),
        ),
      ).toThrowError(
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
      expect(() =>
        validateSignUpFields(
          createStubSignUpInput({
            email: 'email',
            password: 'password',
          }),
        ),
      ).toThrowError(
        new UserInputError('INVALID_FIELDS', {
          errors: ['INVALID_EMAIL', 'INVALID_PASSWORD'],
        }),
      )
    })
  })
})
