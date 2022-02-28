import { createStubMarker } from '__mocks__/marker'
import { createStubSubscription } from '__mocks__/subscription'
import { createStubUser } from '__mocks__/user'
import { UserInputError } from 'apollo-server-errors'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import MockDate from 'mockdate'

import {
  getEvents,
  getProfile,
  getSubscriptions,
  subscribeMarker,
  unsubscribeMarker,
} from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockCreate = jest.fn()
const mockDelete = jest.fn()
const mockFindMany = jest.fn()
const mockFindUniqueMarker = jest.fn()
const mockFindUniqueSubscription = jest.fn()

const stubUser = createStubUser()
const stubMarker = createStubMarker()
const stubMarkerExpired = createStubMarker({
  expires_at: new Date('2000-01-20T00:00:00.000Z'),
})
const stubMarkerWithOwner = createStubMarker({ owners: [stubUser.id] })
const stubSubscription = createStubSubscription()

describe('getEvents', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({ marker: { findMany: mockFindMany } })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindMany.mockResolvedValue([])

    await getEvents(stubUser)

    expect(mockFindMany).toHaveBeenCalledWith({
      include: { category: true },
      orderBy: { created_at: 'asc' },
      where: { owners: { has: 1 } },
    })
  })

  it('returns the user events', () => {
    mockFindMany.mockResolvedValue([createStubMarker()])

    expect(getEvents(stubUser)).resolves.toEqual([
      expect.objectContaining({
        marker: expect.objectContaining({
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
      }),
    ])
  })
})

describe('getProfile', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      user: { findUnique: mockFindUniqueSubscription },
    })
  })

  afterEach(jest.clearAllMocks)

  it('throws an error if the user does not exist', async () => {
    mockFindUniqueSubscription.mockResolvedValue(null)

    await expect(getProfile({ id: 1 })).rejects.toEqual(
      new UserInputError('INVALID_USER'),
    )
  })

  it('uses the correct query parameters', async () => {
    mockFindUniqueSubscription.mockResolvedValue([])

    await getProfile({ id: 1 })

    expect(mockFindUniqueSubscription).toHaveBeenCalledWith({
      where: { id: 1 },
    })
  })

  it('returns the requested user profile', async () => {
    mockFindUniqueSubscription.mockResolvedValue(stubUser)

    await expect(getProfile({ id: 1 })).resolves.toEqual(
      expect.objectContaining({
        email: stubUser.email,
        name: stubUser.name,
      }),
    )
  })
})

describe('getSubscriptions', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({ marker: { findMany: mockFindMany } })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindMany.mockResolvedValue([])

    await getSubscriptions(stubUser)

    expect(mockFindMany).toHaveBeenCalledWith({
      include: { category: true, subscription: true },
      orderBy: { created_at: 'asc' },
      where: { subscription: { some: { user_id: 1 } } },
    })
  })

  it('returns the user subscriptions', () => {
    mockFindMany.mockResolvedValue([
      createStubMarker({
        subscription: [stubSubscription],
      }),
      createStubMarker({
        subscription: [
          createStubSubscription({
            created_at: new Date('2000-05-20T00:00:00.000Z'),
          }),
        ],
      }),
    ])

    expect(getSubscriptions(stubUser)).resolves.toEqual([
      expect.objectContaining({
        date: new Date('2000-05-20T00:00:00.000Z'),
        id: 1,
        marker: expect.objectContaining({
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
      }),
      expect.objectContaining({
        date: new Date('2000-05-25T00:00:00.000Z'),
        id: 1,
        marker: expect.objectContaining({
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
      }),
    ])
  })

  it('throws and error if data is inconsistent', async () => {
    mockFindMany.mockResolvedValue([
      createStubMarker({
        subscription: [createStubSubscription({ user_id: 2 })],
      }),
    ])

    expect(getSubscriptions(stubUser)).rejects.toThrowError(
      new InternalError('ERROR_FORMATTING_SUBSCRIPTION'),
    )
  })
})

describe('subscribeMarker', () => {
  beforeAll(() => {
    MockDate.set(new Date('2000-09-20T00:00:00.000Z'))
  })

  beforeEach(() => {
    mockClient.mockReturnValue({
      marker: { findUnique: mockFindUniqueMarker },
      subscription: {
        create: mockCreate,
        findUnique: mockFindUniqueSubscription,
      },
    })
  })

  afterEach(jest.clearAllMocks)

  afterAll(MockDate.reset)

  it('calls the find function with the correct parameters', async () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockFindUniqueMarker.mockResolvedValue(stubMarker)

    await subscribeMarker(1, stubUser)

    expect(mockFindUniqueSubscription).toHaveBeenCalledWith({
      where: {
        user_id_marker_id: {
          marker_id: 1,
          user_id: 1,
        },
      },
    })
    expect(mockFindUniqueMarker).toHaveBeenCalledWith({
      where: { id: 1 },
    })
  })

  it('throws and error if the marker does not exist', () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockFindUniqueMarker.mockResolvedValue(null)

    expect(subscribeMarker(1, stubUser)).rejects.toThrowError(
      new UserInputError('INVALID_MARKER'),
    )
  })

  it('throws and error if the marker already expired', () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockFindUniqueMarker.mockResolvedValue(stubMarkerExpired)

    expect(subscribeMarker(1, stubUser)).rejects.toThrowError(
      new UserInputError('CAN_NOT_SUBSCRIBE_EXPIRED_MARKER'),
    )
  })

  it('throws and error if the marker does not exist', () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockFindUniqueMarker.mockResolvedValue(stubMarkerWithOwner)

    expect(subscribeMarker(1, stubUser)).rejects.toThrowError(
      new UserInputError('CAN_NOT_SUBSCRIBE_OWN_MARKER'),
    )
  })

  it('does not create the subscription if it already exists', async () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockFindUniqueMarker.mockResolvedValue(stubMarker)

    await subscribeMarker(1, stubUser)

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('calls the create function with the correct parameters', async () => {
    mockFindUniqueSubscription.mockResolvedValue(null)
    mockFindUniqueMarker.mockResolvedValue(stubMarker)

    await subscribeMarker(1, stubUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        marker_id: 1,
        user_id: 1,
      },
    })
  })

  it('creates the subscription if it does not exists yet', () => {
    mockFindUniqueSubscription.mockResolvedValue(null)
    mockFindUniqueMarker.mockResolvedValue(stubMarker)

    expect(subscribeMarker(1, stubUser)).resolves.toEqual(stubUser)
  })

  it('throws and error if subscription fails', () => {
    mockFindUniqueSubscription.mockResolvedValue(null)
    mockFindUniqueMarker.mockResolvedValue(stubMarker)
    mockCreate.mockRejectedValue(new Error('ERROR'))

    expect(subscribeMarker(1, stubUser)).rejects.toThrowError(
      new InternalError('ERROR_SUBSCRIBING_MARKER'),
    )
  })
})

describe('unsubscribeMarker', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      subscription: {
        delete: mockDelete,
        findUnique: mockFindUniqueSubscription,
      },
    })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindUniqueSubscription.mockResolvedValue(null)

    await unsubscribeMarker(1, stubUser)

    expect(mockFindUniqueSubscription).toHaveBeenCalledWith({
      where: {
        user_id_marker_id: {
          marker_id: 1,
          user_id: 1,
        },
      },
    })
  })

  it('does not delete the subscription if it does not exists', async () => {
    mockFindUniqueSubscription.mockResolvedValue(null)

    await unsubscribeMarker(1, stubUser)

    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('calls the create function with the correct parameters', async () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)

    await unsubscribeMarker(1, stubUser)

    expect(mockDelete).toHaveBeenCalledWith({
      where: {
        user_id_marker_id: {
          marker_id: 1,
          user_id: 1,
        },
      },
    })
  })

  it('creates the subscription if it does not exists yet', () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)

    expect(unsubscribeMarker(1, stubUser)).resolves.toEqual(stubUser)
  })

  it('throws and error if subscription fails', () => {
    mockFindUniqueSubscription.mockResolvedValue(stubSubscription)
    mockDelete.mockRejectedValue(new Error('ERROR'))

    expect(unsubscribeMarker(1, stubUser)).rejects.toThrowError(
      new InternalError('ERROR_UNSUBSCRIBING_MARKER'),
    )
  })
})
