import {
  createStubSignInInput,
  createStubSignUpInput,
  createStubUser,
} from '__mocks__/user'
import { UserInputError } from 'apollo-server-errors'
import { client } from 'db'
import { compare, encrypt } from 'domain/crypto'
import { InternalError } from 'domain/errors'
import { sign } from 'jsonwebtoken'

import { signIn, signUp } from './'

jest.mock('db')
jest.mock('domain/crypto')
jest.mock('jsonwebtoken')

const mockCompare = compare as jest.Mock
const mockClient = client as jest.Mock
const mockEncrypt = encrypt as jest.Mock
const mockSign = sign as jest.Mock

const mockCreate = jest.fn()
const mockFindUnique = jest.fn()

const stubSignInInput = createStubSignInInput()
const stubSignUpInput = createStubSignUpInput()

const stubUser = createStubUser()

describe('signIn', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({ user: { findUnique: mockFindUnique } })
  })

  afterEach(jest.clearAllMocks)

  it('throws an error if the email is incorrect', () => {
    mockFindUnique.mockResolvedValue(null)

    expect(signIn(stubSignInInput)).rejects.toThrowError(
      new UserInputError('INVALID_CREDENTIALS'),
    )
  })

  it('throws an error if the password is incorrect', () => {
    mockCompare.mockReturnValue(false)
    mockFindUnique.mockResolvedValue(stubUser)

    expect(signIn(stubSignInInput)).rejects.toThrowError(
      new UserInputError('INVALID_CREDENTIALS'),
    )
  })

  describe('success case', () => {
    beforeEach(() => {
      mockCompare.mockReturnValue(true)
      mockFindUnique.mockResolvedValue(stubUser)
      mockSign.mockReturnValue('token')
    })

    afterEach(jest.clearAllMocks)

    it('searches the correct user', async () => {
      await signIn(stubSignInInput)

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: stubSignInInput.email },
      })
    })

    it('calls the sign function with the correct parameters', async () => {
      await signIn(stubSignInInput)

      expect(mockSign).toHaveBeenCalledWith(
        {
          scope: ['USER'],
          sub: stubUser.id.toString(),
        },
        process.env.JWT_PRIVATE_KEY,
        {
          algorithm: 'RS512',
          expiresIn: '365 days',
        },
      )
    })

    it('returns the session token', () => {
      expect(signIn(stubSignInInput)).resolves.toEqual({ jwt: 'token' })
    })
  })
})

describe('signUp', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      user: { create: mockCreate },
    })
  })

  afterEach(jest.clearAllMocks)

  it('throws an error if user creation fails', () => {
    mockCreate.mockRejectedValue('ERROR')

    expect(signUp(stubSignUpInput)).rejects.toThrowError(
      new InternalError('ERROR_CREATING_USER'),
    )
  })

  describe('success case', () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue(stubUser)
      mockEncrypt.mockReturnValue('encryptedPassword')
      mockSign.mockReturnValue('token')
    })

    afterEach(jest.clearAllMocks)

    it('creates the user with the correct information', async () => {
      await signUp(stubSignUpInput)

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: stubUser.email,
          name: stubUser.name,
          password: 'encryptedPassword',
        },
      })
    })

    it('calls the sign function with the correct parameters', async () => {
      await signUp(stubSignUpInput)

      expect(mockSign).toHaveBeenCalledWith(
        {
          scope: ['USER'],
          sub: stubUser.id.toString(),
        },
        process.env.JWT_PRIVATE_KEY,
        {
          algorithm: 'RS512',
          expiresIn: '365 days',
        },
      )
    })

    it('returns the session token', () => {
      expect(signUp(stubSignUpInput)).resolves.toEqual({ jwt: 'token' })
    })
  })
})
