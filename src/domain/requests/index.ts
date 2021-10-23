import { client } from 'db'
import { InternalError } from 'domain/errors'
import { MinimumIdentifiableMarker } from 'domain/markers'
import { AddRequestInput, Request } from 'generated/graphql'

import {
  NotificationType,
  Request as DatabaseRequest,
  User as DatabaseUser,
} from '.prisma/client'

const createRequest = (
  request: DatabaseRequest & { user: DatabaseUser },
): Request => ({
  ...request,
  expiresAt: request.expires_at,
  user: request.user,
})

export const requests = async ({ id }: MinimumIdentifiableMarker) => {
  const requests = await client().request.findMany({
    include: { user: true },
    where: {
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      marker_id: id,
    },
  })

  return requests.map(createRequest)
}

export const addRequest = async (
  fields: AddRequestInput,
  user: DatabaseUser,
) => {
  try {
    const request = await client().request.create({
      data: {
        description: fields.description,
        expires_at: fields.expiresAt,
        marker_id: fields.marker,
        notifiable: fields.notifiable,
        user_id: user.id,
      },
    })

    if (fields.notifiable) {
      const users = await client().user.findMany({
        include: { device: true },
        where: { subscription: { some: { marker_id: fields.marker } } },
      })

      await client().$transaction(
        users
          .map(({ device: devices, id }) =>
            devices.map(device =>
              client().notification.create({
                data: {
                  device_id: device.id,
                  request_id: request.id,
                  type: NotificationType.push_notification,
                  user_id: id,
                },
              }),
            ),
          )
          .flat(),
      )
    }
  } catch {
    throw new InternalError('ERROR_CREATING_REQUEST')
  }

  return { id: fields.marker }
}
