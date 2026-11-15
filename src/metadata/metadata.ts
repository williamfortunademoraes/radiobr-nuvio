import type { RadioBrowserClient } from '../radio-browser/client.js'
import type { Station } from '../stations/types.js'
import { classifyTags, genreName, normalizeTag } from '../stations/tags.js'
import { radiosEmDestaque } from '../editorial/radios-em-destaque.js'
import { resolveEditorialStations } from '../editorial/resolve.js'
import { matchTop25Editorial } from '../editorial/top-25-match.js'
import { top25Ranking } from '../editorial/top-25-ranking.js'
import { resolveHandlerConfig } from '../config/addon-config.js'
import type { EnrichmentSnapshot } from '../enrichment/snapshot.js'
import { applySnapshot } from '../enrichment/resolve.js'
import {
  curatedLandscapePosterForStation,
  curatedPosterForStation,
} from '../catalog/catalog.js'
import { getTop25Enrichment } from '../editorial/top-25-enrichment.js'

export function createMetadataService(
  client: RadioBrowserClient,
  snapshot?: EnrichmentSnapshot,
  baseUrl?: string,
) {
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
        delete result.background
        return result
      }
      if (args.type !== 'tv' || !args.id.startsWith('radio-br:'))
        return { meta: {} }
      const stations = applySnapshot(
        await (typeof client.searchAllStations === 'function'
          ? client.searchAllStations()
          : client.searchStations()),
        snapshot,
      )
      if (args.id.startsWith('radio-br:editorial:')) {
        const top25Position = Number(args.id.match(/top25-(\d+)$/)?.[1])
        if (top25Position >= 1 && top25Position <= top25Ranking.length) {
          const editorial = radiosEmDestaque.items[top25Position - 1]
          const matched = matchTop25Editorial(
            [top25Ranking[top25Position - 1]],
            stations,
          )[0]
          return {
            meta: presentation(
              editorialMeta(
                {
                  editorial,
                  station: matched.station,
                  playable: Boolean(
                    matched.station?.urlResolved || matched.station?.url,
                  ),
                },
                baseUrl,
              ),
            ),
          }
        }
        const item = radiosEmDestaque.items.find(
          (entry) => `radio-br:editorial:${entry.id}` === args.id,
        )
        if (!item) return { meta: {} }
        const resolved = resolveEditorialStations([item], stations)[0]
        return { meta: presentation(editorialMeta(resolved, baseUrl)) }
      }
      const station = stations.find((item) => item.id === args.id)
      if (!station) return { meta: {} }
      return {
        meta: presentation(stationMeta(station, baseUrl)),
      }
    },
  }
}

function editorialMeta(
  item: ReturnType<typeof resolveEditorialStations>[number],
  baseUrl?: string,
) {
  const { editorial, playable } = item
  const top25Position = Number(editorial.id.match(/^top25-(\d+)$/)?.[1])
  const enrichment = Number.isInteger(top25Position)
    ? getTop25Enrichment(top25Position)
    : undefined
  const station = item.station
    ? {
        ...item.station,
        ...(editorial.city ? { city: editorial.city } : {}),
        ...(editorial.state
          ? { state: editorial.state, stateName: undefined }
          : {}),
        ...(enrichment
          ? {
              slogan: enrichment.slogan,
              about: enrichment.about,
              homepage: enrichment.website,
            }
          : {}),
      }
    : undefined
  const editorialDescription = [
    station
      ? stationDescription(station, editorial.name)
      : [
          enrichment?.slogan
            ? `${editorial.name} – ${enrichment.slogan}`
            : undefined,
          frequencyLine(editorial.name),
          enrichment?.about ? `Sobre: ${enrichment.about}` : undefined,
        ]
          .filter(Boolean)
          .join('\n'),
    editorial.frequency,
    !station && editorial.city ? `Cidade: ${editorial.city}` : undefined,
    !station && editorial.state ? `Estado: ${editorial.state}` : undefined,
    playable ? 'Disponível para reprodução' : 'Indisponível para reprodução',
  ]
    .filter(Boolean)
    .join('\n')
  const poster = cacheBustedStationArtwork(
    editorial.logoUrl ||
      curatedPosterForStation(editorial.name, baseUrl) ||
      item.station?.favicon,
  )
  const background = cacheBustedStationArtwork(
    curatedLandscapePosterForStation(editorial.name, baseUrl) || poster,
  )
  return {
    id: `radio-br:editorial:${editorial.id}`,
    type: 'tv',
    name: editorial.name,
    ...(poster
      ? {
          poster,
          background,
          posterShape: 'square',
        }
      : {}),
    description: editorialDescription,
    ...(enrichment?.website || editorial.websiteUrl
      ? { website: enrichment?.website ?? editorial.websiteUrl }
      : {}),
  }
}
export function stationMeta(station: Station, baseUrl?: string) {
  const description = stationDescription({
    ...station,
    slogan: station.slogan || curatedSlogan(station.name),
    about: station.about || curatedAbout(station.name),
  })
  const poster = cacheBustedStationArtwork(
    curatedPosterForStation(station.name, baseUrl) || station.favicon,
  )
  const background = cacheBustedStationArtwork(
    curatedLandscapePosterForStation(station.name, baseUrl) || poster,
  )
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(poster
      ? {
          poster,
          background,
          posterShape: 'square',
        }
      : {}),
    ...(description ? { description } : {}),
    ...(station.homepage ? { website: station.homepage } : {}),
  }
}

function curatedSlogan(name: string): string | undefined {
  return /fm\s+o\s+dia/i.test(name) ? 'Alegria que Irradia' : undefined
}

function curatedAbout(name: string): string | undefined {
  return /fm\s+o\s+dia/i.test(name)
    ? 'O Rio de Janeiro tem muita música, irreverência, festa, gente bonita e a sua Rádio preferida, que junta tudo isso e muito mais numa única sintonia. A FM O Dia vai além daquilo que se espera de uma emissora, ela representa uma janela pronta pra ser aberta a qualquer momento, onde basta entrar nos 100,5 Mhz do dial carioca para curtir um mundo de ALEGRIA, INOVAÇÃO e SUCESSO.'
    : undefined
}

const genericGenreTags = new Set([
  'am',
  'ao vivo',
  'br',
  'brasil',
  'brazil',
  'brazilian',
  'estacao',
  'estacao de radio',
  'fm',
  'live',
  'online',
  'radio',
  'radio fm',
  'radios',
  'station',
  'stations',
  'tv',
  'web radio',
  'webradio',
])

const translatedGenres: Record<string, string> = {
  'adult contemporary': 'Adulto contemporâneo',
  'smooth jazz': 'Jazz suave',
  jazz: 'Jazz',
  flashback: 'Flashback',
  oldies: 'Clássicos',
  blues: 'Blues',
  'classical music': 'Música clássica',
  classical: 'Música clássica',
  'folk music': 'Música folk',
  folk: 'Música folk',
  'hip hop': 'Hip hop',
  'r and b': 'R&B',
  reggae: 'Reggae',
  lounge: 'Lounge',
  ambient: 'Ambiente',
  'world music': 'Música mundial',
}

const stationArtworkVersion = 'rounded-logo-v2'

function cacheBustedStationArtwork(url?: string): string | undefined {
  if (!url || !url.includes('/assets/logos/stations/')) return url
  const versioned = new URL(url)
  versioned.searchParams.set('v', stationArtworkVersion)
  return versioned.href
}

function displayGenre(tag: string): string {
  const consolidated = classifyTags([tag])[0]
  if (consolidated && consolidated !== 'outros') return genreName(consolidated)
  const translated = translatedGenres[normalizeTag(tag)]
  if (translated) return translated
  const value = tag.trim()
  return value
    ? `${value[0].toLocaleUpperCase('pt-BR')}${value.slice(1)}`
    : value
}

const frequencyPattern =
  /\b\d{2,3}(?:[.,]\d+)?\s*(?:(?:MHz)\s*)?(?:AM|FM|MHz)\b/gi

export function extractFrequencies(text: string): string[] {
  const frequencies: string[] = []
  for (const match of text.matchAll(frequencyPattern)) {
    const frequency = match[0]
      .replace(/\s+/g, ' ')
      .replace(/\.(?=\d)/g, ',')
      .toLocaleUpperCase('pt-BR')
    if (!frequencies.includes(frequency)) frequencies.push(frequency)
  }
  return frequencies
}

function frequencyLine(text?: string): string | undefined {
  const frequencies = text ? extractFrequencies(text) : []
  return frequencies.length
    ? `Frequência: ${frequencies.join(', ')}`
    : undefined
}

export function stationDescription(
  station: Station,
  fallbackName?: string,
): string {
  const lines: string[] = []
  if (station.slogan?.trim())
    lines.push(`${station.name} – ${station.slogan.trim()}`)
  const frequency = frequencyLine(station.name) ?? frequencyLine(fallbackName)
  if (frequency) lines.push(frequency)
  if (station.about?.trim()) lines.push(`Sobre: ${station.about.trim()}`)
  if (station.city) lines.push(`Cidade: ${station.city}`)
  if (station.state)
    lines.push(
      `Estado: ${station.state}${station.stateName ? ` - ${station.stateName}` : ''}`,
    )

  const tags: string[] = station.categories?.length
    ? station.categories
    : Array.isArray(station.tags)
      ? station.tags
      : String(station.tags)
          .split(',')
          .map((tag: string) => tag.trim())
  const genreTags = tags.filter((tag) => {
    const normalized = normalizeTag(tag)
    return normalized && !genericGenreTags.has(normalized)
  })
  const genreLabels: string[] = []
  const seenGenreLabels = new Set<string>()
  for (const tag of genreTags) {
    const classified = classifyTags([tag]).filter(
      (genre) => genre !== 'outros',
    )
    const labels = classified.length
      ? classified.map((genre) => genreName(genre))
      : [displayGenre(tag)]
    for (const label of labels) {
      if (label && !seenGenreLabels.has(normalizeTag(label))) {
        seenGenreLabels.add(normalizeTag(label))
        genreLabels.push(label)
      }
    }
  }
  if (genreLabels.length) lines.push(`Gênero: ${genreLabels.join(', ')}`)
  const format = [
    station.codec,
    station.bitrate ? `${station.bitrate} kbps` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
  if (format) lines.push(`Formato: ${format}`)
  return lines.join('\n')
}
