import type { RadioBrowserClient } from '../radio-browser/client.js'
import type { Station } from '../stations/types.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { resolveEditorialStations } from '../editorial/resolve.js'
import { resolveHandlerConfig } from '../config/addon-config.js'
export function createMetadataService(client: RadioBrowserClient) {
  return {
    async getMetadata(args: { type: string; id: string; config?: unknown }) {
      const config = resolveHandlerConfig(args.config)
      if (!config) return { meta: {} }
      const presentation = (
        meta: ReturnType<typeof stationMeta> | ReturnType<typeof editorialMeta>,
      ) => {
        if (config.o.logos) return meta
        const result = { ...meta }
        delete result.poster
        delete result.posterShape
        return result
      }
      if (args.type !== 'tv' || !args.id.startsWith('radio-br:'))
        return { meta: {} }
      const stations = await client.searchStations()
      if (args.id.startsWith('radio-br:editorial:')) {
        const item = radiosEmDestaque.items.find(
          (entry) => `radio-br:editorial:${entry.id}` === args.id,
        )
        if (!item) return { meta: {} }
        const resolved = resolveEditorialStations([item], stations)[0]
        return { meta: presentation(editorialMeta(resolved)) }
      }
      const station = stations.find((item) => item.id === args.id)
      if (!station) return { meta: {} }
      return { meta: presentation(stationMeta(station)) }
    },
  }
}

function editorialMeta(
  item: ReturnType<typeof resolveEditorialStations>[number],
) {
  const { editorial, playable } = item
  return {
    id: `radio-br:editorial:${editorial.id}`,
    type: 'tv',
    name: editorial.name,
    ...(editorial.logoUrl || item.station?.favicon
      ? {
          poster: editorial.logoUrl || item.station?.favicon,
          posterShape: 'square',
        }
      : {}),
    description: [
      editorial.frequency,
      editorial.city && editorial.state
        ? `${editorial.city}/${editorial.state}`
        : 'Rede nacional',
      editorial.category,
      playable ? 'Disponível para reprodução' : 'Indisponível para reprodução',
    ]
      .filter(Boolean)
      .join(' · '),
    ...(editorial.websiteUrl ? { website: editorial.websiteUrl } : {}),
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
