import { createStubMarker } from '__mocks__/marker'
import {
  createStubSubscribeMarkerInput,
  createStubSubscription,
  createStubUnsubscribeMarkerInput,
} from '__mocks__/subscription'
import { createStubUser } from '__mocks__/user'
import { UserInputError } from 'apollo-server-express'
import { client } from 'db'
import { InternalError } from 'domain/errors'

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
const mockFindUnique = jest.fn()

const stubSubscribeMarkerInput = createStubSubscribeMarkerInput()
const stubUnsubscribeMarkerInput = createStubUnsubscribeMarkerInput()

const stubSubscription = createStubSubscription()
const stubUser = createStubUser()

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
    mockClient.mockReturnValue({ user: { findUnique: mockFindUnique } })
  })

  afterEach(jest.clearAllMocks)

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
    mockFindUnique.mockResolvedValue(stubUser)

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
      where: { subscription: { some: { user_id: 1 } } },
    })
  })

  it('returns the user subscriptions', () => {
    mockFindMany.mockResolvedValue([
      createStubMarker({
        subscription: [stubSubscription],
      }),
    ])

    expect(getSubscriptions(stubUser)).resolves.toEqual([
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
  beforeEach(() => {
    mockClient.mockReturnValue({
      subscription: { create: mockCreate, findUnique: mockFindUnique },
    })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindUnique.mockResolvedValue(stubSubscription)

    await subscribeMarker(stubSubscribeMarkerInput, stubUser)

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        user_id_marker_id: {
          marker_id: 1,
          user_id: 1,
        },
      },
    })
  })

  it('does not create the subscription if it already exists', async () => {
    mockFindUnique.mockResolvedValue(stubSubscription)

    await subscribeMarker(stubSubscribeMarkerInput, stubUser)

    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('calls the create function with the correct parameters', async () => {
    mockFindUnique.mockResolvedValue(null)

    await subscribeMarker(stubSubscribeMarkerInput, stubUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        marker_id: 1,
        user_id: 1,
      },
    })
  })

  it('creates the subscription if it does not exists yet', () => {
    mockFindUnique.mockResolvedValue(null)

    expect(
      subscribeMarker(stubSubscribeMarkerInput, stubUser),
    ).resolves.toEqual(stubUser)
  })

  it('throws and error if subscription fails', () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockRejectedValue(new Error('ERROR'))

    expect(
      subscribeMarker(stubSubscribeMarkerInput, stubUser),
    ).rejects.toThrowError(new InternalError('ERROR_SUBSCRIBING_MARKER'))
  })
})

describe('unsubscribeMarker', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      subscription: { delete: mockDelete, findUnique: mockFindUnique },
    })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindUnique.mockResolvedValue(null)

    await unsubscribeMarker(stubUnsubscribeMarkerInput, stubUser)

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        user_id_marker_id: {
          marker_id: 1,
          user_id: 1,
        },
      },
    })
  })

  it('does not delete the subscription if it does not exists', async () => {
    mockFindUnique.mockResolvedValue(null)

    await unsubscribeMarker(stubUnsubscribeMarkerInput, stubUser)

    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('calls the create function with the correct parameters', async () => {
    mockFindUnique.mockResolvedValue(stubSubscription)

    await unsubscribeMarker(stubUnsubscribeMarkerInput, stubUser)

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
    mockFindUnique.mockResolvedValue(stubSubscription)

    expect(
      unsubscribeMarker(stubUnsubscribeMarkerInput, stubUser),
    ).resolves.toEqual(stubUser)
  })

  it('throws and error if subscription fails', () => {
    mockFindUnique.mockResolvedValue(stubSubscription)
    mockDelete.mockRejectedValue(new Error('ERROR'))

    expect(
      unsubscribeMarker(stubUnsubscribeMarkerInput, stubUser),
    ).rejects.toThrowError(new InternalError('ERROR_UNSUBSCRIBING_MARKER'))
  })
})
