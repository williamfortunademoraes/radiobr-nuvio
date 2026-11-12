import type { RadioBrowserClient } from '../radio-browser/client.js'
import type { Station } from '../stations/types.js'
export function createMetadataService(client: RadioBrowserClient) {
  return {
    async getMetadata(args: { type: string; id: string }) {
      if (args.type !== 'tv' || !args.id.startsWith('radio-br:'))
        return { meta: {} }
      const stations = await client.searchStations()
      const station = stations.find((item) => item.id === args.id)
      if (!station) return { meta: {} }
      return { meta: stationMeta(station) }
    },
  }
}
export function stationMeta(station: Station) {
  const details = [
    station.state,
    station.language,
    station.tags.length ? `tags: ${station.tags.join(', ')}` : undefined,
    station.codec,
    station.bitrate ? `${station.bitrate} kbps` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(station.favicon
      ? { poster: station.favicon, posterShape: 'square' }
      : {}),
    ...(details ? { description: details } : {}),
    ...(station.homepage ? { website: station.homepage } : {}),
  }
}
