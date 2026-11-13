import type { RadioBrowserClient } from '../radio-browser/client.js'
import { genreDefinitions, resolveGenre } from '../stations/tags.js'
import { normalizeState, type StateCode } from '../stations/states.js'
import type { Station } from '../stations/types.js'
import {
  catalogAllowed,
  resolveHandlerConfig,
  type AddonConfig,
} from '../config/addon-config.js'
import { groupStationsByGenre } from './grouping.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { matchTop25Editorial } from '../editorial/top-25-match.js'
import { top25Ranking } from '../editorial/top-25-ranking.js'
import { REGIONS, stationRegion } from './geography.js'
import type { EnrichmentSnapshot } from '../enrichment/snapshot.js'
import { applySnapshot } from '../enrichment/resolve.js'
import { genreCover, regionCover } from './covers.js'

const curatedEditorialLogos: Record<string, string> = {
  'Rádio Gaúcha 93.7 FM': 'gaucha-93-7.png',
  'Rádio Bandeirantes 107.3 FM': 'bandeirantes-107-3.jfif',
  'Super Rádio Tupi 96.5 FM': 'tupi-96-5.png',
  'Rádio Itatiaia 610 AM 95.7 FM': 'itatiaia-610-am-95-7.jpg',
  'Rádio Jovem Pan News': 'jovem-pan-news.png',
  'Rádio CBN São Paulo 90.5 FM': 'cbn-sao-paulo-90-5.png',
  'Rádio Band 96.1 FM': 'band-96-1.png',
  'Rádio Grenal 95.9 FM': 'grenal-95-9.png',
  'Rádio JB FM 99.9': 'jb-fm-99-9.png',
  'Rádio 89 FM Rádio Rock': 'radio-89-rock.webp',
  'Rádio Antena 1 94.7 FM': 'antena-1-94-7.png',
  'Radio Saudade 99.7 FM': 'saudade-99-7.png',
  'Rádio Clube 105.5 FM': 'clube-105-5.png',
  'Rádio Alpha 101.7 FM': 'alpha-101-7.jpg',
  'Rádio Metropolitana 98.5 FM': 'metropolitana-98-5.png',
  'Rádio Nativa 95.3 FM': 'nativa-95-3.png',
  'Rádio FM O Dia 100.5': 'fm-o-dia-100-5.png',
  'Rádio Liberdade 92.9 FM': 'liberdade-92-9.jpg',
}

function curatedEditorialPoster(
  name: string,
  basePoster?: string,
): string | undefined {
  const file = curatedEditorialLogos[name]
  return file && basePoster
    ? new URL(`/assets/logos/stations/${file}`, basePoster).href
    : undefined
}

export interface CatalogArgs {
  type: string
  id: string
  extra?: {
    search?: string
    skip?: number
    genre?: string
    region?: string
    state?: string
  }
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
  snapshot?: EnrichmentSnapshot,
) {
  return {
    async getCatalog(args: CatalogArgs) {
      if (args.type !== 'tv') return { metas: [] }

      const config = resolveHandlerConfig(args.config)
      if (!config) return { metas: [] }
      if (args.id === 'radio-br-genres')
        return {
          metas: config.g.map((genre) => ({
            id: `radio-br-genre-${genre}`,
            type: 'tv' as const,
            name: genreDefinitions.find((item) => item.id === genre)?.name ?? genre,
            poster: new URL(genreCover(genre), fallbackPoster ?? 'http://127.0.0.1').href,
            posterShape: 'square' as const,
          })),
        }
      if (args.id === 'radio-br-regions')
        return {
          metas: REGIONS.map((region) => ({
            id: `radio-br-region-${region.id}`,
            type: 'tv' as const,
            name: region.name,
            poster: new URL(regionCover(region.id), fallbackPoster ?? 'http://127.0.0.1').href,
            posterShape: 'square' as const,
          })),
        }
      if (args.id === 'radios-em-destaque') {
        if (!catalogAllowed(args.id, config)) return { metas: [] }
        if (!radiosEmDestaque.enabled) return { metas: [] }
        const stations = applySnapshot(
          await (typeof client.searchAllStations === 'function'
            ? client.searchAllStations()
            : client.searchStations()),
          snapshot,
        )
        const matchesState = stateFilter(config.s)
        const search = args.extra?.search?.trim().toLocaleLowerCase('pt-BR')
        const matched = matchTop25Editorial(top25Ranking, stations)
        return {
          metas: matched
            .filter(
              (item) =>
                !config.s.length ||
                (item.station && matchesState(item.station)),
            )
            .filter(
              (item) =>
                !search ||
                item.ranking.name.toLocaleLowerCase('pt-BR').includes(search),
            )
            .map((item) => ({
              id: `radio-br:editorial:top25-${item.ranking.position}`,
              type: 'tv' as const,
              name: item.ranking.name,
              ...(config.o.logos &&
              (curatedEditorialPoster(item.ranking.name, fallbackPoster) ||
                item.station?.favicon ||
                fallbackPoster)
                ? {
                    poster:
                      curatedEditorialPoster(
                        item.ranking.name,
                        fallbackPoster,
                      ) ||
                      item.station?.favicon ||
                      fallbackPoster,
                    posterShape: 'square',
                  }
                : {}),
              description: [
                item.ranking.location,
                item.matchStatus === 'matched'
                  ? 'Disponível para reprodução'
                  : 'Indisponível para reprodução',
              ].join(' · '),
            })),
        }
      }
      if (!catalogAllowed(args.id, config)) return { metas: [] }

      const search = args.extra?.search
      const skip = args.extra?.skip ?? 0
      const stations = applySnapshot(
        args.id === 'radio-br-catalog' &&
          !search?.trim() &&
          typeof client.searchAllStations === 'function'
          ? (await client.searchAllStations()).slice(skip, skip + 100)
          : await client.searchStations({ search, offset: skip }),
        snapshot,
      )

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

      if (args.id === 'radio-br-region') {
        const requestedRegion = args.extra?.region
          ?.trim()
          .toLocaleLowerCase('pt-BR')
        const regionId = REGIONS.find(
          (region) =>
            !requestedRegion ||
            region.id === requestedRegion ||
            region.name.toLocaleLowerCase('pt-BR') === requestedRegion,
        )?.id
        return {
          metas: stations
            .filter(
              (station) => !regionId || stationRegion(station) === regionId,
            )
            .filter(matchesState)
            .map(preview),
        }
      }

      if (args.id === 'radio-br-state') {
        const requestedState = normalizeState(args.extra?.state)
        return {
          metas: stations
            .filter(
              (station) =>
                (!requestedState ||
                  normalizeState(station.state) === requestedState) &&
                matchesState(station),
            )
            .map(preview),
        }
      }

      const regionId = REGIONS.find(
        (region) => args.id === `radio-br-region-${region.id}`,
      )?.id
      if (regionId)
        return {
          metas: stations
            .filter((station) => stationRegion(station) === regionId)
            .map(preview),
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
        case 'radio-br-catalog':
          return { metas: stations.filter(matchesState).map(preview) }

        case 'radio-br-news-sports': {
          const newsSports = grouped()['noticias-esportes']
          return {
            metas: newsSports.filter(matchesState).map(preview),
          }
        }

        case 'radio-br-outros':
          return {
            metas: grouped().outros.filter(matchesState).map(preview),
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
