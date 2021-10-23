import { Device, Platform as DatabasePlatform } from '@prisma/client'
import {
  Platform,
  RegisterDeviceTokenInput,
  UnregisterDeviceTokenInput,
} from 'generated/graphql'

export const createStubDevice = (opts?: Partial<Device>): Device => ({
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  device_id: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
  id: 1,
  platform: DatabasePlatform.android,
  token:
    'fsIh9iDITUqJiAlL_qfnU5:APA91bFdopRyp6PIGjqtu8dySDb6ClDYMbhnOSVmo-Fv7eSlkiBlPOqFD56gMugmMJzJG6Sq0GPXZa0Sk45UWjHCMuXTJXUzbm-NoTXV9D0cS58qrdbgWYFZ2RNyNhiy5XPG58Mk3Ezo',
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  user_id: 1,
  ...opts,
})

export const createStubRegisterDeviceTokenInput = (
  opts?: Partial<RegisterDeviceTokenInput>,
): RegisterDeviceTokenInput => ({
  deviceId: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
  platform: Platform.Android,
  token:
    'fsIh9iDITUqJiAlL_qfnU5:APA91bFdopRyp6PIGjqtu8dySDb6ClDYMbhnOSVmo-Fv7eSlkiBlPOqFD56gMugmMJzJG6Sq0GPXZa0Sk45UWjHCMuXTJXUzbm-NoTXV9D0cS58qrdbgWYFZ2RNyNhiy5XPG58Mk3Ezo',
  ...opts,
})

export const createStubUnregisterDeviceTokenInput = (
  opts?: Partial<UnregisterDeviceTokenInput>,
): UnregisterDeviceTokenInput => ({
  deviceId: 'd5a31b6d-ab97-4a71-9fcc-9541f1df068f',
  ...opts,
})
