import { client } from 'db'
import { logError } from 'domain/logger'
import * as admin from 'firebase-admin'
import { replace } from 'lodash'
import { format } from 'util'

export enum Notification {
  MARKER_REQUEST = 'MARKER_REQUEST',
}

type Payload = Record<
  Notification,
  {
    data: { type: string }
    notification: { body: string }
  }
>

export const Payload: Payload = {
  [Notification.MARKER_REQUEST]: {
    data: { type: Notification.MARKER_REQUEST },
    notification: { body: 'New request' },
  },
}

export const initializeFirebase = () =>
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT,
      privateKey: replace(process.env.FIREBASE_AUTH_KEY, /\\n/g, '\n'),
      projectId: process.env.FIREBASE_PROJECT_ID,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })

export const sendNotifications = async (
  userIds: number[],
  template: Notification,
) => {
  const users = await client().user.findMany({
    include: { device: true },
    where: { id: { in: userIds } },
  })

  const tokens = users.reduce<string[]>((accumulator, user) => {
    if (user.device.length) {
      user.device.forEach(device => accumulator.push(device.token))
    }

    return accumulator
  }, [])

  if (tokens.length > 0) {
    try {
      await admin.messaging().sendMulticast({
        ...Payload[template],
        tokens,
      })
    } catch (error) {
      logError({
        error,
        info: format(
          'ERROR_SENDING_NOTIFICATION: "%s"',
          Payload[template].data.type,
        ),
      })
    }
  }
}
