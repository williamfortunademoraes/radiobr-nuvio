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

export function createMetadataService(
  client: RadioBrowserClient,
  snapshot?: EnrichmentSnapshot,
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
              editorialMeta({
                editorial,
                station: matched.station,
                playable: Boolean(
                  matched.station?.urlResolved || matched.station?.url,
                ),
              }),
            ),
          }
        }
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
  const station = item.station
    ? {
        ...item.station,
        ...(editorial.city ? { city: editorial.city } : {}),
        ...(editorial.state
          ? { state: editorial.state, stateName: undefined }
          : {}),
      }
    : undefined
  const editorialDescription = [
    station
      ? stationDescription(station, editorial.name)
      : frequencyLine(editorial.name),
    editorial.frequency,
    !station && editorial.city ? `Cidade: ${editorial.city}` : undefined,
    !station && editorial.state ? `Estado: ${editorial.state}` : undefined,
    playable ? 'Disponível para reprodução' : 'Indisponível para reprodução',
  ]
    .filter(Boolean)
    .join('\n')
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
    description: editorialDescription,
    ...(editorial.websiteUrl ? { website: editorial.websiteUrl } : {}),
  }
}
export function stationMeta(station: Station) {
  const description = stationDescription(station)
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(station.favicon
      ? { poster: station.favicon, posterShape: 'square' }
      : {}),
    ...(description ? { description } : {}),
    ...(station.homepage ? { website: station.homepage } : {}),
  }
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
  if (station.slogan?.trim()) lines.push(station.slogan.trim())
  const frequency = frequencyLine(station.name) ?? frequencyLine(fallbackName)
  if (frequency) lines.push(frequency)
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
  const genres = tags.filter((tag) => {
    const normalized = normalizeTag(tag)
    return normalized && !genericGenreTags.has(normalized)
  })
  const uniqueGenres = [
    ...new Map(genres.map((tag) => [normalizeTag(tag), tag])).values(),
  ]
  const aboutParts = ['Estação de rádio']
  if (uniqueGenres.length)
    lines.push(`Gênero: ${uniqueGenres.map(displayGenre).join(', ')}`)
  if (uniqueGenres.length) aboutParts.push(`de ${uniqueGenres.map(displayGenre).join(', ')}`)
  const location = station.city && station.state
    ? `${station.city} (${station.state})`
    : station.city || station.state
  if (location) aboutParts.push(`em ${location}`)
  lines.push(`Sobre: ${aboutParts.join(' ')}.`)

  const format = [
    station.codec,
    station.bitrate ? `${station.bitrate} kbps` : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
  if (format) lines.push(`Formato: ${format}`)
  return lines.join('\n')
}
