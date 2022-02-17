import { createStubAddMarkerInput, createStubMarker } from '__mocks__/marker'
import { UserInputError } from 'apollo-server-errors'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import MockDate from 'mockdate'

import { addMarker, confirmMarker, markers } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockCreate = jest.fn()
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()

const stubAddMarkerInput = createStubAddMarkerInput()

const stubMarker = createStubMarker()

describe('addMarker', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({
      marker: { create: mockCreate },
    })
  })

  afterEach(jest.clearAllMocks)

  afterAll(MockDate.reset)

  it('calls the find function with the correct parameters', async () => {
    mockCreate.mockResolvedValue(stubMarker)

    await addMarker(stubAddMarkerInput, [])

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        category_id: 1,
        description: 'Vení y llevate un plato de comida caliente.',
        duration: 180,
        expires_at: new Date('2000-10-04T00:00:00.000Z'),
        latitude: -34.895365,
        longitude: -56.18769,
        name: 'Residencia Universitaria Sagrada Familia',
        owners: [],
        recurrence: 'RRULE:FREQ=DAILY;BYHOUR=20',
        time_zone: 'America/Montevideo',
      },
      include: { category: true },
    })
  })

  it('returns the new marker', async () => {
    mockCreate.mockResolvedValue(stubMarker)

    await expect(addMarker(stubAddMarkerInput, [])).resolves.toEqual(
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
        requests: [],
        subscribedUsers: 0,
        timeZone: 'America/Montevideo',
      }),
    )
  })

  it('throws and error if marker creation fails', () => {
    mockCreate.mockRejectedValue(new Error('ERROR'))

    expect(addMarker(stubAddMarkerInput, [])).rejects.toThrowError(
      new InternalError('ERROR_ADDING_MARKER'),
    )
  })
})

describe('confirmMarker', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({
      marker: {
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
    })
    mockFindUnique.mockResolvedValue(stubMarker)
  })

  afterEach(jest.clearAllMocks)

  afterAll(MockDate.reset)

  it('calls the update function with the correct parameters', async () => {
    mockUpdate.mockResolvedValue(stubMarker)

    await confirmMarker(1)

    expect(mockUpdate).toHaveBeenCalledWith({
      data: { expires_at: new Date('2000-10-04T00:00:00.000Z') },
      include: { category: true },
      where: { id: 1 },
    })
  })

  it('returns the confirmed marker', async () => {
    mockUpdate.mockResolvedValue(stubMarker)

    await expect(confirmMarker(1)).resolves.toEqual(
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
        requests: [],
        subscribedUsers: 0,
        timeZone: 'America/Montevideo',
      }),
    )
  })

  it('throws and error if the marker does not exist', () => {
    mockFindUnique.mockResolvedValue(null)

    expect(confirmMarker(1)).rejects.toThrowError(
      new UserInputError('INVALID_MARKER'),
    )
  })

  it('throws and error if marker update fails', () => {
    mockUpdate.mockRejectedValue(new Error('ERROR'))

    expect(confirmMarker(1)).rejects.toThrowError(
      new InternalError('ERROR_CONFIRMING_MARKER'),
    )
  })
})

describe('markers', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({ marker: { findMany: mockFindMany } })
  })

  afterEach(jest.clearAllMocks)

  afterAll(MockDate.reset)

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
        timeZone: 'America/Montevideo',
      }),
    ])
  })
})
