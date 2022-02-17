import { Subscription } from '@prisma/client'

export const createStubSubscription = (
  opts?: Partial<Subscription>,
): Subscription => ({
  created_at: new Date('2000-05-25T00:00:00.000Z'),
  id: 1,
  marker_id: 1,
  updated_at: new Date('2000-05-25T00:00:00.000Z'),
  user_id: 1,
  ...opts,
})
