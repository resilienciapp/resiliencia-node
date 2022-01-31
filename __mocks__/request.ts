import {
  Marker as DatabaseMarker,
  Request as DatabaseRequest,
  User as DatabaseUser,
} from '@prisma/client'
import { AddRequestInput } from 'generated/graphql'

import { createStubMarker } from './marker'
import { createStubUser } from './user'

type Request = DatabaseRequest & {
  marker?: DatabaseMarker
  user?: DatabaseUser
}

const stubMarker = createStubMarker()

export const createStubRequest = (opts?: Partial<Request>): Request => ({
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  description:
    'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
  expires_at: null,
  id: 1,
  marker: stubMarker,
  marker_id: stubMarker.id,
  notifiable: true,
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  user: createStubUser(),
  user_id: 1,
  ...opts,
})

export const createStubAddRequestInput = (
  opts?: Partial<AddRequestInput>,
): AddRequestInput => ({
  description:
    'Necesitamos cualquier verdura para cocinar. Recibimos hasta las 19 horas.',
  expiresAt: null,
  marker: 1,
  notifiable: false,
  ...opts,
})
