import { createStubSignUpInput, createStubUser } from '__mocks__/support/user'
import { client } from 'db'
import { encrypt } from 'domain/crypto'
import { InternalError } from 'domain/errors'
import { sign } from 'jsonwebtoken'

import { createAccount } from './'

jest.mock('db')
jest.mock('domain/crypto')
jest.mock('jsonwebtoken')

const mockClient = client as jest.Mock
const mockEncrypt = encrypt as jest.Mock
const mockSign = sign as jest.Mock

const mockCreate = jest.fn()

const stubSignUpInput = createStubSignUpInput()
const stubUser = createStubUser()

describe('createAccount', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      user: { create: mockCreate },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if user creation fails', () => {
    mockCreate.mockRejectedValue('ERROR')

    expect(createAccount(stubSignUpInput)).rejects.toThrowError(
      new InternalError('ERROR_CREATING_USER'),
    )
  })

  describe('success case', () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue(stubUser)
      mockEncrypt.mockReturnValue('encryptedPassword')
      mockSign.mockReturnValue('token')
    })

    afterEach(() => {
      jest.clearAllMocks()
    })

    it('creates the user with the correct information', async () => {
      await createAccount(stubSignUpInput)

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: stubUser.email,
          name: stubUser.name,
          password: 'encryptedPassword',
        },
      })
    })

    it('calls the sign function with the correct parameters', async () => {
      await createAccount(stubSignUpInput)

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
      expect(createAccount(stubSignUpInput)).resolves.toEqual({ jwt: 'token' })
    })
  })
})
