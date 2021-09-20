import {
  Category as DatabaseCategory,
  Marker as DatabaseMarker,
} from '@prisma/client'
import { client } from 'db'
import { Marker } from 'generated/graphql'

type _Marker = DatabaseMarker & { category: DatabaseCategory }

const createMarker = (marker: _Marker): Marker => ({
  ...marker,
  expiresAt: marker.expires_at,
})

export const markers = async () => {
  const markers = await client().marker.findMany({
    include: { category: true },
    where: {
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
  })

  return markers.map(marker => createMarker(marker))
}
