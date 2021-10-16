import { createStubAddMarkerInput, createStubMarker } from '__mocks__/marker'
import { createStubSubscription } from '__mocks__/subscription'
import { createStubUser } from '__mocks__/user'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import MockDate from 'mockdate'

import { addMarker, isSubscribed, markers } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockCreate = jest.fn()
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()

const stubAddMarkerInput = createStubAddMarkerInput()

const stubMarker = createStubMarker()
const stubUser = createStubUser()

describe('addMarker', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      marker: { create: mockCreate, findMany: mockFindMany },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('calls the find function with the correct parameters', async () => {
    mockFindMany.mockResolvedValue([])

    await addMarker(stubAddMarkerInput, [])

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        category_id: 1,
        description: 'Vení y llevate un plato de comida caliente.',
        duration: 180,
        expires_at: null,
        latitude: -34.895365,
        longitude: -56.18769,
        name: 'Residencia Universitaria Sagrada Familia',
        owners: [],
        recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
      },
    })
  })

  it('returns the list of markers', () => {
    mockFindMany.mockResolvedValue([])

    expect(addMarker(stubAddMarkerInput, [])).resolves.toEqual([])
  })

  it('throws and error if marker creation fails', () => {
    mockCreate.mockRejectedValue(new Error('ERROR'))

    expect(addMarker(stubAddMarkerInput, [])).rejects.toThrowError(
      new InternalError('ERROR_ADDING_MARKER'),
    )
    expect(mockFindMany).not.toHaveBeenCalled()
  })
})

describe('isSubscribed', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      subscription: { findUnique: mockFindUnique },
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns true if the user is subscribed', () => {
    mockFindUnique.mockResolvedValue(createStubSubscription())

    expect(isSubscribed(stubMarker, stubUser)).resolves.toBeTruthy()
  })

  it('returns false if the user is not subscribed', () => {
    mockFindUnique.mockResolvedValue(null)

    expect(isSubscribed(stubMarker, stubUser)).resolves.toBeFalsy()
  })
})

describe('markers', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({
      marker: { findMany: mockFindMany },
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

    await markers()

    expect(mockFindMany).toHaveBeenCalledWith({
      include: { category: true },
      where: {
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
    })
  })

  it('returns an empty list of markers', () => {
    mockFindMany.mockResolvedValue([])

    expect(markers()).resolves.toEqual([])
  })

  it('returns the list of markers', () => {
    mockFindMany.mockResolvedValue([stubMarker])

    expect(markers()).resolves.toEqual([
      expect.objectContaining({
        category: expect.objectContaining({
          description: 'Entrega de comida.',
          id: 1,
          name: 'Olla Popular',
        }),
        description: 'Vení y llevate un plato de comida caliente.',
        duration: 180,
        expiresAt: null,
        id: 1,
        latitude: -34.895365,
        longitude: -56.18769,
        name: 'Residencia Universitaria Sagrada Familia',
        recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
      }),
    ])
  })
})
