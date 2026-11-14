import type { RadioBrowserClient } from '../radio-browser/client.js'
import { genreDefinitions, resolveGenre } from '../stations/tags.js'
import { normalizeState, STATES, type StateCode } from '../stations/states.js'
import type { Station } from '../stations/types.js'
import {
  catalogAllowed,
  resolveHandlerConfig,
  type AddonConfig,
} from '../config/addon-config.js'
import { groupStationsByGenre } from './grouping.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import {
  matchTop25Editorial,
  removeTop25Duplicates,
} from '../editorial/top-25-match.js'
import { top25Ranking } from '../editorial/top-25-ranking.js'
import { REGIONS, stationRegion } from './geography.js'
import type { EnrichmentSnapshot } from '../enrichment/snapshot.js'
import { applySnapshot } from '../enrichment/resolve.js'
import { genreCover, stateCover } from './covers.js'
import { sameStationIdentity, stationIdentityFromName } from './identity.js'

function curatedLogoKey(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/^radio\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

const curatedEditorialLogoEntries = [
  ['Rádio Gaúcha 93.7 FM', 'gaucha-93-7.png'],
  ['Rádio Bandeirantes 107.3 FM', 'bandeirantes-107-3.jfif'],
  ['Super Rádio Tupi 96.5 FM', 'tupi-96-5.png'],
  ['Rádio Itatiaia 610 AM 95.7 FM', 'itatiaia-610-am-95-7.jpg'],
  ['Rádio Jovem Pan News', 'jovem-pan-news.png'],
  ['Rádio CBN São Paulo 90.5 FM', 'cbn-sao-paulo.svg'],
  ['CBN São Paulo', 'cbn-sao-paulo.svg'],
  ['Rádio Band 96.1 FM', 'band-96-1.png'],
  ['Rádio Grenal 95.9 FM', 'grenal-95-9.png'],
  ['Rádio JB FM 99.9', 'jb-fm-99-9.png'],
  ['Rádio 89 FM Rádio Rock', 'radio-89-rock.jfif'],
  ['Rádio Rock - 89,1 FM', 'radio-89-rock.jfif'],
  ['Rádio Antena 1 94.7 FM', 'antena-1-94-7.jfif'],
  ['Rádio Antena 1 São Paulo 94.7 FM', 'antena-1-94-7.png'],
  ['Rádio Antena 1 Rio de Janeiro 103.7 FM', 'antena-1-rio-103-7.jpg'],
  ['Rádio BandNews SP 96.9 FM', 'bandnews-sp-96-9.jpg'],
  ['Rádio Band News 90.3', 'bandnews-90-3.jpg'],
  ['Radio Saudade 99.7 FM', 'saudade-99-7.png'],
  ['Rádio Clube 105.5 FM', 'clube-105-5.png'],
  ['Rádio Alpha 101.7 FM', 'alpha-101-7.jpg'],
  ['Alpha FM 101.7', 'alpha-101-7.jpg'],
  ['Rádio 99.5 FM Goiânia', '99-5-fm-goiania.png'],
  ['99.5 FM Goiânia', '99-5-fm-goiania.png'],
  ['Jovem Pan FM Florianópolis', 'jovem-pan-florianopolis-sc.png'],
  ['Jovem Pan FM - Florianópolis - SC', 'jovem-pan-florianopolis-sc.png'],
  ['Rádio Metropolitana 98.5 FM', 'metropolitana-98-5.png'],
  ['Rádio Nativa 95.3 FM', 'nativa-95-3.png'],
  ['Rádio Nativa 95.3 São Paulo', 'nativa-sp-95-3.png'],
  ['Nativa FM 95.3 São Paulo', 'nativa-sp-95-3.png'],
  ['Rádio Rap Brasil', 'radio-rap-brasil.jpg'],
  ['Rap Brasil', 'radio-rap-brasil.jpg'],
  ['Rádio Transamérica', 'radio-transamerica.webp'],
  ['Transamérica', 'radio-transamerica.webp'],
  ['Rádio FM O Dia 99.7 Macaé', 'fm-o-dia-99-7-macae.jfif'],
  ['FM O Dia 99.7 Macaé', 'fm-o-dia-99-7-macae.jfif'],
  ['Rádio Animu', 'radio-animu.jfif'],
  ['Radio Animu', 'radio-animu.jfif'],
  ['Rádio Reggae Brasil', 'radio-reggae-brasil.jfif'],
  ['Radio Reggae Brasil', 'radio-reggae-brasil.jfif'],
  ['Rádio FM O Dia 100.5', 'fm-o-dia-100-5.png'],
  ['Rádio Liberdade 92.9 FM', 'liberdade-92-9.jpg'],
  ['Rádio Aparecida 104.3 FM', 'aparecida-104-3.jpg'],
  ['Rádio Jornal de Recife 90.3 FM', 'jornal-recife-90-3.jpg'],
  ['Rádio Melodia 97.5 FM', 'melodia-97-5.png'],
  ['Rádio TMC 100.1 FM', 'tmc-100-1.webp'],
  ['Rádio Kiss FM 92.5', 'kiss-92-5.png'],
  ['Rádio Flashback', 'flashback.png'],
  ['Smooth Jazz Lounge Radio', 'smooth-jazz-lounge.jpg'],
  ['Smooth Jazz Lounge', 'smooth-jazz-lounge.jpg'],
  ['Rádio Mix 106.3 FM', 'mix-106-3.jpg'],
  ['Rádio Jangadeiro 88.9 FM', 'jangadeiro-88-9.jfif'],
  ['Rádio Disney 91.3 FM', 'radio-disney.png'],
  ['Rádio Globo - Rio de Janeiro', 'radio-globo.png'],
  ['Mix Rio 102.1 Rio de Janeiro, RJ', 'mix-rio-102-1.jfif'],
  ['Rádio 105 FM', 'radio-105-fm.jfif'],
  ['Jovem Pan FM - Belo Horizonte 99,1', 'jovem-pan-belo-horizonte.png'],
  ['Rádio 106.7 Sertaneja', '106-7-sertaneja.jfif'],
  ['106.7 Sertaneja', '106-7-sertaneja.jfif'],
  ['Energia FM (97 FM)', 'energia-fm-97.jfif'],
  ['Rádio Energia FM 97 FM', 'energia-fm-97.jfif'],
  ['Kiss FM São Paulo', 'kiss-fm-sao-paulo.jfif'],
  ['Rádio Kiss FM São Paulo', 'kiss-fm-sao-paulo.jfif'],
  ['Rádio Nova Paradiso 89.5 FM', 'nova-paradiso-89-5.jfif'],
  ['Alpha MPB', 'radio-alpha-mpb.webp'],
  ['Rádio Alvorada FM 94.9', 'radio-alvorada.png'],
  ['Rádio Anos 80', 'radio-anos-80.png'],
  ['BR - The Classic Rock', 'br-classic-rock.png'],
  ['Rádio Buteco Sertanejo', 'buteco-sertanejo.png'],
  ['Rádio Cultura FM 103.1', 'cultura-fm-103-1.webp'],
  ['Geração Samba e Pagode', 'geracao-samba-pagode.png'],
  ['Rádio Jovem Pan FM Belo Horizonte 99,1', 'jovem-pan-bh-99-1.png'],
  ['Rádio Jovem Pan FM São Paulo 100.9', 'jovem-pan-sp-100-9.png'],
  ['Maracutaia FM', 'maracutaia-fm.png'],
]

const curatedEditorialLogos: Record<string, string> = Object.fromEntries(
  curatedEditorialLogoEntries.map(([name, file]) => [
    curatedLogoKey(name),
    file,
  ]),
)

export function curatedPosterForStation(
  name: string,
  basePoster?: string,
): string | undefined {
  const exactFile = curatedEditorialLogos[curatedLogoKey(name)]
  const identity = stationIdentityFromName(name)
  const candidateKey = curatedLogoKey(name)
  const tokenOverlap = (curatedName: string) =>
    curatedLogoKey(curatedName)
      .split(' ')
      .filter((token) => candidateKey.split(' ').includes(token)).length
  const file =
    exactFile ??
    curatedEditorialLogoEntries
      .filter(([curatedName]) => {
        const curatedIdentity = stationIdentityFromName(curatedName)
        return (
          curatedIdentity.brand === identity.brand &&
          identity.frequencies.length > 0 &&
          identity.frequencies.some((frequency) =>
            curatedIdentity.frequencies.includes(frequency),
          )
        )
      })
      .sort(
        (left, right) => tokenOverlap(right[0]) - tokenOverlap(left[0]),
      )[0]?.[1]
  return file && basePoster
    ? new URL(`/assets/logos/stations/${file}`, basePoster).href
    : undefined
}

export function curatedLandscapePosterForStation(
  name: string,
  basePoster?: string,
): string | undefined {
  const file = curatedEditorialLogos[curatedLogoKey(name)]
  return file && basePoster
    ? new URL(
        `/assets/logos/stations/${file.replace(/\.[^.]+$/, '-landscape.jpg')}`,
        basePoster,
      ).href
    : undefined
}

const curatedPoster = curatedPosterForStation

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
  const curatedPosterUrl = curatedPoster(station.name, fallbackPoster)
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(showLogos && (curatedPosterUrl || station.favicon)
      ? {
          poster: curatedPosterUrl || station.favicon,
          posterShape: 'square',
        }
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

export function dedupeStations(stations: readonly Station[]): Station[] {
  const canonical: Station[] = []
  for (const station of stations) {
    if (canonical.some((existing) => sameStationIdentity(existing, station)))
      continue
    canonical.push(station)
  }
  return canonical
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
            name:
              genreDefinitions.find((item) => item.id === genre)?.name ?? genre,
            poster: new URL(
              genreCover(genre),
              fallbackPoster ?? 'http://127.0.0.1',
            ).href,
            posterShape: 'square' as const,
          })),
        }
      if (args.id === 'radio-br-states')
        return {
          metas: STATES.map((state) => ({
            id: `radio-br-state-${state.code.toLowerCase()}`,
            type: 'tv' as const,
            name: state.name,
            poster: new URL(
              stateCover(state.code),
              fallbackPoster ?? 'http://127.0.0.1',
            ).href,
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
              (curatedPoster(item.ranking.name, fallbackPoster) ||
                item.station?.favicon ||
                fallbackPoster)
                ? {
                    poster:
                      curatedPoster(item.ranking.name, fallbackPoster) ||
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
      const stations = dedupeStations(
        removeTop25Duplicates(
          top25Ranking,
          applySnapshot(
            args.id === 'radio-br-catalog' &&
              !search?.trim() &&
              typeof client.searchAllStations === 'function'
              ? (await client.searchAllStations()).slice(skip, skip + 100)
              : await client.searchStations({ search, offset: skip }),
            snapshot,
          ),
        ),
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
            .filter(matchesState)
            .map(preview),
        }

      const stateCode = STATES.find(
        (state) => args.id === `radio-br-state-${state.code.toLowerCase()}`,
      )?.code
      if (stateCode)
        return {
          metas: stations
            .filter((station) => normalizeState(station.state) === stateCode)
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
