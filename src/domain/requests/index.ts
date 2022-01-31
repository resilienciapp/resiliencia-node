import { client } from 'db'
import { InternalError } from 'domain/errors'
import { createMarker, MinimumIdentifiableMarker } from 'domain/markers'
import { Notification, sendNotifications } from 'domain/notification'
import { AddRequestInput, Request } from 'generated/graphql'

import {
  NotificationType,
  Prisma,
  Request as DatabaseRequest,
  User as DatabaseUser,
} from '.prisma/client'

const createRequest = (
  request: DatabaseRequest & { user: DatabaseUser },
): Request => ({
  ...request,
  createdAt: request.created_at,
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
      include: {
        marker: true,
      },
    })

    if (fields.notifiable) {
      const users = await client().user.findMany({
        include: { device: true },
        where: { subscription: { some: { marker_id: fields.marker } } },
      })

      const transactions: Prisma.Prisma__NotificationClient<unknown>[] = []

      users.forEach(({ device: devices, id }) => {
        devices.forEach(device => {
          transactions.push(
            client().notification.create({
              data: {
                device_id: device.id,
                request_id: request.id,
                type: NotificationType.push_notification,
                user_id: id,
              },
            }),
          )
        })
      })

      await Promise.all([
        client().$transaction(transactions),
        sendNotifications(users, Notification.MARKER_REQUEST, {
          description: request.description,
          markerId: request.marker_id.toString(),
          markerName: request.marker.name,
          requestId: request.id.toString(),
        }),
      ])
    }
  } catch {
    throw new InternalError('ERROR_CREATING_REQUEST')
  }

  return client()
    .marker.findUnique({
      include: { category: true },
      where: { id: fields.marker },
    })
    .then(marker => {
      if (!marker) {
        throw new InternalError('ERROR_CREATING_REQUEST')
      }

      return createMarker(marker)
    })
}
