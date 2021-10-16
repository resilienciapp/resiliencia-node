import { client } from 'db'
import { InternalError } from 'domain/errors'
import { MinimumIdentifiableMarker } from 'domain/markers'
import { AddRequestInput, Request, User } from 'generated/graphql'

import {
  Request as DatabaseRequest,
  User as DatabaseUser,
} from '.prisma/client'

const createRequest = (
  request: DatabaseRequest & { user: DatabaseUser },
): Request => ({
  ...request,
  expiresAt: request.expires_at,
  user: { id: request.user.id } as User,
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
    await client().request.create({
      data: {
        description: fields.description,
        expires_at: fields.expiresAt,
        marker_id: fields.marker,
        notifiable: fields.notifiable,
        user_id: user.id,
      },
    })
  } catch {
    throw new InternalError('ERROR_CREATING_REQUEST')
  }

  return { id: fields.marker }
}
