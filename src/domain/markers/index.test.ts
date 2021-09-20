import { createStubMarker } from '__mocks__/marker'
import { client } from 'db'
import MockDate from 'mockdate'

import { markers } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockFindMany = jest.fn()

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
    mockFindMany.mockResolvedValue([createStubMarker()])

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
