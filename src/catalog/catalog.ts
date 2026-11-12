import type { RadioBrowserClient } from '../radio-browser/client.js'
import { resolveGenre } from '../stations/tags.js'
import type { Station } from '../stations/types.js'
import { groupStationsByGenre } from './grouping.js'
import { rankFeaturedStations } from './ranking.js'

export interface CatalogArgs {
  type: string
  id: string
  extra?: { search?: string; skip?: number; genre?: string }
}

const catalogIds = [
  'radio-br-catalog',
  'radio-br-featured',
  'radio-br-genre',
] as const

export function stationPreview(station: Station) {
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(station.favicon
      ? { poster: station.favicon, posterShape: 'square' }
      : {}),
  }
}

export function createCatalogService(client: RadioBrowserClient) {
  return {
    async getCatalog(args: CatalogArgs) {
      if (
        args.type !== 'tv' ||
        !catalogIds.includes(args.id as (typeof catalogIds)[number])
      )
        return { metas: [] }

      const stations = await client.searchStations({
        search: args.extra?.search,
        offset: args.extra?.skip ?? 0,
      })

      if (args.id === 'radio-br-featured')
        return { metas: rankFeaturedStations(stations).map(stationPreview) }

      if (args.id === 'radio-br-genre') {
        const requested = args.extra?.genre?.trim()
        if (!requested) return { metas: stations.map(stationPreview) }
        const genre = resolveGenre(requested)
        if (!genre) return { metas: [] }
        return {
          metas: groupStationsByGenre(stations)[genre].map(stationPreview),
        }
      }

      return { metas: stations.map(stationPreview) }
    },
  }
}
