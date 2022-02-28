import { User } from '@prisma/client'
import { UserInputError } from 'apollo-server-errors'
import { client } from 'db'
import { InternalError } from 'domain/errors'
import {
  RegisterDeviceTokenInput,
  UnregisterDeviceTokenInput,
} from 'generated/graphql'

const ANDROID = process.env.APP_VERSION_ANDROID
const IOS = process.env.APP_VERSION_IOS

export const appVersion = () => ({
  android: ANDROID,
  ios: IOS,
})

export const registerDeviceToken = async (
  input: RegisterDeviceTokenInput,
  user: User,
) => {
  const device = await client().device.findFirst({
    where: { device_id: input.deviceId },
  })

  try {
    if (device) {
      await client().device.update({
        data: {
          platform: input.platform,
          token: input.token,
          user_id: user.id,
        },
        where: {
          device_id: input.deviceId,
        },
      })
    } else {
      await client().device.create({
        data: {
          device_id: input.deviceId,
          platform: input.platform,
          token: input.token,
          user_id: user.id,
        },
      })
    }
  } catch {
    throw new InternalError('ERROR_REGISTERING_TOKEN')
  }

  return user
}

export const unregisterDeviceToken = async (
  input: UnregisterDeviceTokenInput,
  user: User,
) => {
  const device = await client().device.findFirst({
    where: { device_id: input.deviceId, user_id: user.id },
  })

  if (!device) {
    throw new UserInputError('INVALID_DEVICE_IDENTIFIER')
  }

  try {
    await client().device.delete({
      where: { device_id: input.deviceId },
    })
  } catch {
    throw new InternalError('ERROR_UNREGISTERING_TOKEN')
  }

  return user
}
