import { client } from 'db'

export const markersAnalytics = async () => {
  const markers = await client().marker.findMany({
    include: {
      category: { select: { name: true } },
      request: { select: { id: true } },
      subscription: { select: { id: true } },
    },
  })

  return markers.map(
    ({
      category,
      expires_at,
      owners,
      request,
      subscription,
      time_zone,
      ...rest
    }) => ({
      category: category.name,
      expiresAt: expires_at,
      owners: owners.length,
      requests: request.length,
      subscriptions: subscription.length,
      timeZone: time_zone,
      ...rest,
    }),
  )
}
