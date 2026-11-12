import type { RadioBrowserStation } from '../radio-browser/types.js'
import { stationId, type Station } from './types.js'
export { stationId }

export function isBrazilianAvailableStation(raw: RadioBrowserStation): boolean {
  return (
    raw.countrycode?.toUpperCase() === 'BR' &&
    raw.lastcheckok !== 0 &&
    raw.lastcheckok !== '0' &&
    Boolean(raw.stationuuid) &&
    Boolean(raw.url_resolved || raw.url)
  )
}

export function normalizeStation(raw: RadioBrowserStation): Station | null {
  if (!isBrazilianAvailableStation(raw)) return null
  const uuid = raw.stationuuid!.trim()
  const tags = (raw.tags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return {
    id: stationId(uuid),
    stationUuid: uuid,
    name: raw.name?.trim() || 'Rádio sem nome',
    url: raw.url,
    urlResolved: raw.url_resolved,
    favicon: raw.favicon || undefined,
    homepage: raw.homepage || undefined,
    countryCode: 'BR',
    state: raw.state || undefined,
    language: raw.language || undefined,
    tags,
    codec: raw.codec || undefined,
    bitrate: raw.bitrate || undefined,
    hls: raw.hls === 1,
  }
}
