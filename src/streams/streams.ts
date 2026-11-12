import type { RadioBrowserClient } from '../radio-browser/client.js'
export function createStreamService(client: RadioBrowserClient) {
  return {
    async getStreams(args: { type: string; id: string }) {
      if (args.type !== 'tv' || !/^radio-br:[0-9a-f-]{36}$/i.test(args.id))
        return { streams: [] }
      const station = (await client.searchStations()).find(
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
