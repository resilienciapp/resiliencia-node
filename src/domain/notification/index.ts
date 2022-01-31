import { logError } from 'domain/logger'
import * as admin from 'firebase-admin'
import { replace } from 'lodash'
import { format } from 'util'

import { Device, User as DatabaseUser } from '.prisma/client'

export enum Notification {
  MARKER_REQUEST = 'MARKER_REQUEST',
}

type Payload = {
  [Notification.MARKER_REQUEST]: {
    description: string
    markerId: string
    markerName: string
    requestId: string
  }
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

type User = DatabaseUser & { device: Device[] }

export const sendNotifications = async <T extends Notification>(
  users: User[],
  type: T,
  data: Payload[T],
) => {
  const tokens = users.reduce<string[]>((accumulator, user) => {
    if (user.device.length) {
      user.device.forEach(device => accumulator.push(device.token))
    }

    return accumulator
  }, [])

  if (tokens.length > 0) {
    try {
      await admin.messaging().sendMulticast({
        data: { ...data, type },
        tokens,
      })
    } catch (error) {
      logError({
        error,
        info: format('ERROR_SENDING_NOTIFICATION: "%s"', type),
      })
    }
  }
}
