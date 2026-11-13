import type { RadioBrowserClient } from '../radio-browser/client.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { resolveEditorialStations } from '../editorial/resolve.js'
import { matchTop25Editorial } from '../editorial/top-25-match.js'
import { top25Ranking } from '../editorial/top-25-ranking.js'
export function createStreamService(client: RadioBrowserClient) {
  return {
    async getStreams(args: { type: string; id: string }) {
      if (args.type !== 'tv' || !args.id.startsWith('radio-br:'))
        return { streams: [] }
      if (args.id.startsWith('radio-br:editorial:')) {
        const stations = await (typeof client.searchAllStations === 'function'
          ? client.searchAllStations()
          : client.searchStations())
        const item = radiosEmDestaque.items.find(
          (entry) => `radio-br:editorial:${entry.id}` === args.id,
        )
        const top25Position = Number(args.id.match(/top25-(\d+)$/)?.[1])
        const top25Station =
          top25Position >= 1 && top25Position <= top25Ranking.length
            ? matchTop25Editorial(
                [top25Ranking[top25Position - 1]],
                stations,
              )[0].station
            : undefined
        const resolved = item
          ? resolveEditorialStations([item], stations)[0]
          : undefined
        const station = top25Station ?? resolved?.station
        const url = station?.urlResolved || station?.url
        return url ? { streams: [{ url }] } : { streams: [] }
      }
      if (!/^radio-br:[0-9a-f-]{36}$/i.test(args.id)) return { streams: [] }
      const stations = await client.searchStations()
      const station = stations.find((item) => item.id === args.id)
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
