import { createStubUser } from '__mocks__/user'
import { UserInputError } from 'apollo-server-express'
import { client } from 'db'

import { getProfile } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockFindUnique = jest.fn()

const mockUser = createStubUser()

describe('getProfile', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({ user: { findUnique: mockFindUnique } })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if the user does not exist', async () => {
    mockFindUnique.mockResolvedValue(null)

    await expect(getProfile({ id: 1 })).rejects.toEqual(
      new UserInputError('INVALID_USER'),
    )
  })

  it('uses the correct query parameters', async () => {
    mockFindUnique.mockResolvedValue([])

    await getProfile({ id: 1 })

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    })
  })

  it('returns the requested user profile', async () => {
    mockFindUnique.mockResolvedValue(mockUser)

    await expect(getProfile({ id: 1 })).resolves.toEqual(
      expect.objectContaining({
        email: mockUser.email,
        name: mockUser.name,
      }),
    )
  })
})
