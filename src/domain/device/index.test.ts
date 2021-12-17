import {
  createStubDevice,
  createStubRegisterDeviceTokenInput,
  createStubUnregisterDeviceTokenInput,
} from '__mocks__/device'
import { createStubUser } from '__mocks__/user'
import { UserInputError } from 'apollo-server-express'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import { Platform } from 'generated/graphql'

import { registerDeviceToken, unregisterDeviceToken } from '.'

jest.mock('db')

const mockClient = client as jest.Mock

const mockCreate = jest.fn()
const mockDelete = jest.fn()
const mockUpdate = jest.fn()
const mockFindFirst = jest.fn()

const stubDevice = createStubDevice()
const stubRegisterDeviceTokenInput = createStubRegisterDeviceTokenInput()
const stubUnregisterDeviceTokenInput = createStubUnregisterDeviceTokenInput()
const stubUser = createStubUser()

describe('registerDeviceToken', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      device: {
        create: mockCreate,
        findFirst: mockFindFirst,
        update: mockUpdate,
      },
    })
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    mockFindFirst.mockResolvedValue(null)

    await registerDeviceToken(stubRegisterDeviceTokenInput, stubUser)

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
        user_id: 1,
      },
    })
  })

  it('calls the update function with the correct parameters', async () => {
    mockFindFirst.mockResolvedValue(stubDevice)

    await registerDeviceToken(stubRegisterDeviceTokenInput, stubUser)

    expect(mockUpdate).toHaveBeenCalledWith({
      data: {
        platform: Platform.Android,
        token:
          'fsIh9iDITUqJiAlL_qfnU5:APA91bFdopRyp6PIGjqtu8dySDb6ClDYMbhnOSVmo-Fv7eSlkiBlPOqFD56gMugmMJzJG6Sq0GPXZa0Sk45UWjHCMuXTJXUzbm-NoTXV9D0cS58qrdbgWYFZ2RNyNhiy5XPG58Mk3Ezo',
      },
      where: {
        device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
      },
    })
  })

  it('calls the create function with the correct parameters', async () => {
    mockFindFirst.mockResolvedValue(null)

    await registerDeviceToken(stubRegisterDeviceTokenInput, stubUser)

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
        platform: Platform.Android,
        token:
          'fsIh9iDITUqJiAlL_qfnU5:APA91bFdopRyp6PIGjqtu8dySDb6ClDYMbhnOSVmo-Fv7eSlkiBlPOqFD56gMugmMJzJG6Sq0GPXZa0Sk45UWjHCMuXTJXUzbm-NoTXV9D0cS58qrdbgWYFZ2RNyNhiy5XPG58Mk3Ezo',
        user_id: 1,
      },
    })
  })

  it('returns the corresponding user', () => {
    expect(
      registerDeviceToken(stubRegisterDeviceTokenInput, stubUser),
    ).resolves.toEqual(stubUser)
  })

  it('throws an error if token registration fails', () => {
    mockFindFirst.mockResolvedValue(stubDevice)
    mockUpdate.mockRejectedValue(new Error('ERROR'))

    expect(
      registerDeviceToken(stubRegisterDeviceTokenInput, stubUser),
    ).rejects.toThrowError(new InternalError('ERROR_REGISTERING_TOKEN'))
  })
})

describe('unregisterDeviceToken', () => {
  beforeEach(() => {
    mockClient.mockReturnValue({
      device: { delete: mockDelete, findFirst: mockFindFirst },
    })
    mockFindFirst.mockResolvedValue(stubDevice)
  })

  afterEach(jest.clearAllMocks)

  it('calls the find function with the correct parameters', async () => {
    await unregisterDeviceToken(stubUnregisterDeviceTokenInput, stubUser)

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
        user_id: 1,
      },
    })
  })

  it('throws an error if token and user does not match', () => {
    mockFindFirst.mockResolvedValue(null)

    expect(
      unregisterDeviceToken(stubUnregisterDeviceTokenInput, stubUser),
    ).rejects.toThrowError(new UserInputError('INVALID_DEVICE_IDENTIFIER'))
  })

  it('calls the delete function with the correct parameters', async () => {
    await unregisterDeviceToken(stubUnregisterDeviceTokenInput, stubUser)

    expect(mockDelete).toHaveBeenCalledWith({
      where: {
        device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
      },
    })
  })

  it('returns the corresponding user', () => {
    expect(
      unregisterDeviceToken(stubUnregisterDeviceTokenInput, stubUser),
    ).resolves.toEqual(stubUser)
  })

  it('throws an error if token unregistration fails', () => {
    mockDelete.mockRejectedValue(new Error('ERROR'))

    expect(
      unregisterDeviceToken(stubUnregisterDeviceTokenInput, stubUser),
    ).rejects.toThrowError(new InternalError('ERROR_UNREGISTERING_TOKEN'))
  })
})
