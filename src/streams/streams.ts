import type { RadioBrowserClient } from '../radio-browser/client.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { resolveEditorialStations } from '../editorial/resolve.js'
export function createStreamService(client: RadioBrowserClient) {
  return {
    async getStreams(args: { type: string; id: string }) {
      if (args.type !== 'tv' || !args.id.startsWith('radio-br:'))
        return { streams: [] }
      const stations = await client.searchStations()
      if (args.id.startsWith('radio-br:editorial:')) {
        const item = radiosEmDestaque.items.find((entry) => `radio-br:editorial:${entry.id}` === args.id)
        const resolved = item ? resolveEditorialStations([item], stations)[0] : undefined
        const url = resolved?.station?.urlResolved || resolved?.station?.url
        return url ? { streams: [{ url }] } : { streams: [] }
      }
      if (!/^radio-br:[0-9a-f-]{36}$/i.test(args.id)) return { streams: [] }
      const station = stations.find(
        (item) => item.id === args.id,
      )
      const url = station?.urlResolved || station?.url
      return url
        ? {
            streams: [
              {
                url,
                title:
                  [
                    station.codec,
                    station.bitrate ? `${station.bitrate} kbps` : undefined,
                  ]
                    .filter(Boolean)
                    .join(' · ') || undefined,
              },
            ],
          }
        : { streams: [] }
    },
  }
}
