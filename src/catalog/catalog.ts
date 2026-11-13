import type { RadioBrowserClient } from '../radio-browser/client.js'
import { resolveGenre } from '../stations/tags.js'
import type { Station } from '../stations/types.js'
import { groupStationsByGenre } from './grouping.js'
import { groupStationsByState } from './grouping.js'
import {
  BRAZILIAN_REGIONS,
  normalizeBrazilianState,
} from '../stations/locations.js'
import {
  genreCollections,
  regionCollections,
  stateCollections,
} from './collections.js'
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

const isCollectionCatalog = (id: string) =>
  id === 'radio-br-genres' ||
  id === 'radio-br-regions' ||
  /^radio-br-(genre|region|state)-/.test(id)

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
        (!catalogIds.includes(args.id as (typeof catalogIds)[number]) &&
          !isCollectionCatalog(args.id))
      )
        return { metas: [] }

      const stations = await client.searchStations({
        search: args.extra?.search,
        offset: args.extra?.skip ?? 0,
      })

      if (args.id === 'radio-br-genres') return { metas: genreCollections() }
      if (args.id === 'radio-br-regions') return { metas: regionCollections() }
      const genreMatch = args.id.match(/^radio-br-genre-(.+)$/)
      if (genreMatch) {
        const genre = resolveGenre(genreMatch[1])
        return genre
          ? { metas: groupStationsByGenre(stations)[genre].map(stationPreview) }
          : { metas: [] }
      }
      const regionMatch = args.id.match(/^radio-br-region-(.+)$/)
      if (regionMatch) {
        const region = BRAZILIAN_REGIONS.find(
          (item) => item.id === regionMatch[1],
        )
        return region ? { metas: stateCollections(region.id) } : { metas: [] }
      }
      const stateMatch = args.id.match(/^radio-br-state-(.+)$/)
      if (stateMatch) {
        const state = normalizeBrazilianState(stateMatch[1])
        return state
          ? { metas: groupStationsByState(stations)[state].map(stationPreview) }
          : { metas: [] }
      }

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
