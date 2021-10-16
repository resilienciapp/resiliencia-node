import { createStubAddRequestInput, createStubRequest } from '__mocks__/request'
import { createStubUser } from '__mocks__/user'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import MockDate from 'mockdate'

import { addRequest, requests } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockCreate = jest.fn()
const mockFindMany = jest.fn()

const stubAddRequestInput = createStubAddRequestInput()

const stubRequest = createStubRequest()
const stubUser = createStubUser()

describe('addRequest', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      request: { create: mockCreate },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls the find function with the correct parameters', async () => {
    await addRequest(stubAddRequestInput, stubUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        description:
          'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
        expires_at: null,
        marker_id: 1,
        notifiable: true,
        user_id: 1,
      },
    })
  })

  it('returns the corresponding marker', () => {
    expect(addRequest(stubAddRequestInput, stubUser)).resolves.toEqual({
      id: 1,
    })
  })

  it('throws and error if request creation fails', () => {
    mockCreate.mockRejectedValue(new Error('ERROR'))

    expect(addRequest(stubAddRequestInput, stubUser)).rejects.toThrowError(
      new InternalError('ERROR_CREATING_REQUEST'),
    )
  })
})

describe('requests', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({
      request: { findMany: mockFindMany },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    MockDate.reset()
  })

  it('calls the find function with the correct parameters', async () => {
    mockFindMany.mockResolvedValue([])

    await requests({ id: 1 })

    expect(mockFindMany).toHaveBeenCalledWith({
      include: { user: true },
      where: {
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        marker_id: 1,
      },
    })
  })

  it('returns an empty list of markers', () => {
    mockFindMany.mockResolvedValue([])

    expect(requests({ id: 1 })).resolves.toEqual([])
  })

  it('returns the list of markers', () => {
    mockFindMany.mockResolvedValue([stubRequest])

    expect(requests({ id: 1 })).resolves.toEqual([
      expect.objectContaining({
        description:
          'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
        expiresAt: null,
        id: 1,
        user: expect.objectContaining({ id: 1 }),
      }),
    ])
  })
})
