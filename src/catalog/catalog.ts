import type { RadioBrowserClient } from '../radio-browser/client.js'
import { resolveGenre } from '../stations/tags.js'
import { normalizeState, type StateCode } from '../stations/states.js'
import type { Station } from '../stations/types.js'
import {
  catalogAllowed,
  resolveHandlerConfig,
  type AddonConfig,
} from '../config/addon-config.js'
import { groupStationsByGenre } from './grouping.js'
import { rankFeaturedStations } from './ranking.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { resolveEditorialStations } from '../editorial/resolve.js'

export interface CatalogArgs {
  type: string
  id: string
  extra?: { search?: string; skip?: number; genre?: string }
  config?: unknown
}

export function stationPreview(
  station: Station,
  showLogos = true,
  fallbackPoster?: string,
) {
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(showLogos && (station.favicon || fallbackPoster)
      ? { poster: station.favicon || fallbackPoster, posterShape: 'square' }
      : {}),
  }
}

function editorialPreview(
  item: ReturnType<typeof resolveEditorialStations>[number],
  showLogos = true,
) {
  return {
    id: `radio-br:editorial:${item.editorial.id}`,
    type: 'tv',
    name: item.editorial.name,
    ...(showLogos && (item.editorial.logoUrl || item.station?.favicon)
      ? {
          poster: item.editorial.logoUrl || item.station?.favicon,
          posterShape: 'square',
        }
      : {}),
    description: [
      item.editorial.city && item.editorial.state
        ? `${item.editorial.city}/${item.editorial.state}`
        : 'Rede nacional',
      item.editorial.category,
      item.playable
        ? 'Disponível para reprodução'
        : 'Indisponível para reprodução',
    ].join(' · '),
  }
}

function stateFilter(states: readonly StateCode[]) {
  if (states.length === 0) return () => true
  const allowed = new Set(states)
  return (station: Station) => {
    const state = normalizeState(station.state)
    return state !== undefined && allowed.has(state)
  }
}

function dedupeById(stations: readonly Station[]): Station[] {
  const seen = new Set<string>()
  return stations.filter((station) => {
    if (seen.has(station.id)) return false
    seen.add(station.id)
    return true
  })
}

function requestedGenres(config: AddonConfig) {
  return config.g
}

export function createCatalogService(
  client: RadioBrowserClient,
  fallbackPoster?: string,
) {
  return {
    async getCatalog(args: CatalogArgs) {
      if (args.type !== 'tv') return { metas: [] }

      const config = resolveHandlerConfig(args.config)
      if (!config) return { metas: [] }
      if (args.id === 'radios-em-destaque') {
        if (!catalogAllowed(args.id, config)) return { metas: [] }
        if (!radiosEmDestaque.enabled) return { metas: [] }
        const stations = await client.searchStations()
        const matchesState = stateFilter(config.s)
        const search = args.extra?.search?.trim().toLocaleLowerCase('pt-BR')
        return {
          metas: resolveEditorialStations(radiosEmDestaque.items, stations)
            .filter(
              (item) =>
                !config.s.length ||
                (item.station && matchesState(item.station)),
            )
            .filter(
              (item) =>
                !search ||
                item.editorial.name.toLocaleLowerCase('pt-BR').includes(search),
            )
            .map((item) => editorialPreview(item, config.o.logos)),
        }
      }
      if (!catalogAllowed(args.id, config)) return { metas: [] }

      const stations = await client.searchStations({
        search: args.extra?.search,
        offset: args.extra?.skip ?? 0,
      })

      const matchesState = stateFilter(config.s)
      const preview = (station: Station) =>
        stationPreview(station, config.o.logos, fallbackPoster)
      const grouped = () => groupStationsByGenre(stations)

      const genreCollection = args.id.match(/^radio-br-genre-(.+)$/)?.[1]
      if (genreCollection) {
        const genre = resolveGenre(genreCollection)
        return genre && config.g.includes(genre)
          ? { metas: grouped()[genre].filter(matchesState).map(preview) }
          : { metas: [] }
      }

      const region = args.id.match(/^radio-br-region-([a-z]{2})$/)?.[1]
      if (region)
        return {
          metas: stations
            .filter(
              (station) =>
                normalizeState(station.state)?.toLowerCase() === region,
            )
            .map(preview),
        }

      switch (args.id) {
        case 'radio-br-featured':
          return {
            metas: rankFeaturedStations(stations.filter(matchesState)).map(
              preview,
            ),
          }

        case 'radio-br-catalog':
          return { metas: stations.filter(matchesState).map(preview) }

        case 'radio-br-news':
          return {
            metas: grouped().noticias.filter(matchesState).map(preview),
          }

        case 'radio-br-sports':
          return {
            metas: grouped().esportes.filter(matchesState).map(preview),
          }

        case 'radio-br-nogenero':
          return {
            metas: grouped()['nao-informado'].filter(matchesState).map(preview),
          }

        case 'radio-br-genre': {
          const requested = args.extra?.genre?.trim()
          if (requested) {
            const genre = resolveGenre(requested)
            if (!genre) return { metas: [] }
            if (!config.g.includes(genre)) return { metas: [] }
            return {
              metas: grouped()[genre].filter(matchesState).map(preview),
            }
          }

          // No genre selected: show the union of the configured genres. With
          // the default config (all genres), this is the full collection, as
          // it was before personalization existed.
          const groups = grouped()
          const union = requestedGenres(config).flatMap(
            (genre) => groups[genre],
          )
          return {
            metas: dedupeById(union).filter(matchesState).map(preview),
          }
        }

        default:
          return { metas: [] }
      }
    },
  }
}
