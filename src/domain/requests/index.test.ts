import { createStubDevice } from '__mocks__/device'
import { createStubMarker } from '__mocks__/marker'
import { createStubAddRequestInput, createStubRequest } from '__mocks__/request'
import { createStubUser } from '__mocks__/user'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { Notification, sendNotifications } from 'domain/notification'
import MockDate from 'mockdate'

import { addRequest, requests } from '.'
import { NotificationType } from '.prisma/client'

jest.mock('db')
jest.mock('domain/notification')

const mockClient = client as jest.Mock

const mockCreateNotification = jest.fn()
const mockCreateRequest = jest.fn()
const mockFindMany = jest.fn()
const mockFindUnique = jest.fn()
const mockTransaction = jest.fn()

const stubAddRequestInput = createStubAddRequestInput()

const stubDevice = createStubDevice()
const stubMarker = createStubMarker({ owners: [1] })
const stubRequest = createStubRequest()
const stubUser = createStubUser()
const stubUserWithDevice = createStubUser({ device: [stubDevice] })

describe('addRequest', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      $transaction: mockTransaction,
      marker: { findUnique: mockFindUnique },
      notification: { create: mockCreateNotification },
      request: { create: mockCreateRequest },
      user: { findMany: mockFindMany },
    })
    mockTransaction.mockImplementation((_: Promise<unknown>[]) =>
      Promise.all(_),
    )
    mockFindUnique.mockResolvedValue(stubMarker)
  })

  afterEach(jest.clearAllMocks)

  it('calls the create function with the correct parameters', async () => {
    await addRequest(stubAddRequestInput, stubUser)

    expect(mockCreateRequest).toHaveBeenCalledWith({
      data: {
        description:
          'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
        expires_at: null,
        marker_id: 1,
        notifiable: false,
        user_id: 1,
      },
      include: {
        marker: true,
      },
    })
  })

  it('returns the corresponding marker', () => {
    expect(addRequest(stubAddRequestInput, stubUser)).resolves.toEqual(
      expect.objectContaining(stubMarker),
    )
  })

  it('finds the subscribers if it is a notifiable request', async () => {
    mockCreateRequest.mockResolvedValue(stubRequest)
    mockFindMany.mockResolvedValue([])

    await addRequest(createStubAddRequestInput({ notifiable: true }), stubUser)

    expect(mockFindMany).toHaveBeenCalledWith({
      include: { device: true },
      where: { subscription: { some: { marker_id: 1 } } },
    })
  })

  it('creates the notifications for the subscribers', async () => {
    const users = [stubUserWithDevice, stubUserWithDevice]

    mockCreateRequest.mockResolvedValue(stubRequest)
    mockFindMany.mockResolvedValue(users)
    mockCreateNotification.mockResolvedValue({
      device_id: stubDevice.id,
      request_id: stubRequest.id,
      type: NotificationType.push_notification,
      user_id: stubUser.id,
    })

    await addRequest(createStubAddRequestInput({ notifiable: true }), stubUser)

    expect(mockCreateNotification).toHaveBeenCalledTimes(2)
    expect(mockTransaction).toHaveBeenCalled()
    expect(sendNotifications).toHaveBeenCalledWith(
      users,
      Notification.MARKER_REQUEST,
      {
        markerId: '1',
        markerName: 'Residencia Universitaria Sagrada Familia',
        requestId: '1',
      },
    )
  })

  it('throws and error if request creation fails', () => {
    mockCreateRequest.mockRejectedValue(new Error('ERROR'))

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

  afterEach(jest.clearAllMocks)

  afterAll(MockDate.reset)

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
        user: expect.objectContaining({
          email: 'joaquin.aguirre@fing.edu.uy',
          name: 'Joaquín Aguirre',
        }),
      }),
    ])
  })
})
