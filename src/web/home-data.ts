import { groupStationsByGenre } from '../catalog/grouping.js'
import { REGIONS, stationRegion } from '../catalog/geography.js'
import { genreName, GENRE_IDS, type GenreId } from '../stations/tags.js'
import { normalizeState, stateName } from '../stations/states.js'
import type { Station } from '../stations/types.js'

export interface HomeStation {
  id: string
  stationUuid: string
  name: string
  favicon?: string
  homepage?: string
  city?: string
  state?: string
  stateName?: string
  codec?: string
  bitrate?: number
  slogan?: string
  about?: string
  url?: string
  urlResolved?: string
  tags: string[]
}

export interface HomeSection {
  id: string
  title: string
  kind: 'featured' | 'genre' | 'region'
  stations: HomeStation[]
}

export interface HomePortalData {
  featured: HomeStation[]
  genres: HomeSection[]
  regions: HomeSection[]
  availableGenres: { id: GenreId; name: string }[]
}

function isPlayable(station: Station): boolean {
  return Boolean(station.urlResolved?.trim() || station.url?.trim())
}

function toHomeStation(station: Station): HomeStation {
  const normalizedState = normalizeState(station.state)
  return {
    id: station.id,
    stationUuid: station.stationUuid,
    name: station.name,
    ...(station.favicon ? { favicon: station.favicon } : {}),
    ...(station.homepage ? { homepage: station.homepage } : {}),
    ...(station.city ? { city: station.city } : {}),
    ...(station.state ? { state: station.state } : {}),
    ...(normalizedState ? { stateName: stateName(normalizedState) } : {}),
    ...(station.codec ? { codec: station.codec } : {}),
    ...(station.bitrate ? { bitrate: station.bitrate } : {}),
    ...(station.slogan ? { slogan: station.slogan } : {}),
    ...(station.about ? { about: station.about } : {}),
    ...(station.url ? { url: station.url } : {}),
    ...(station.urlResolved ? { urlResolved: station.urlResolved } : {}),
    tags: station.tags,
  }
}

function dedupePlayable(stations: readonly Station[]): Station[] {
  const seen = new Set<string>()
  return stations.filter((station) => {
    if (!isPlayable(station) || seen.has(station.id)) return false
    seen.add(station.id)
    return true
  })
}

export function buildHomePortalData(
  stations: readonly Station[],
  maxPerSection = 12,
): HomePortalData {
  const limit = Math.max(1, Math.trunc(maxPerSection))
  const playable = dedupePlayable(stations)
  const ranked = [...playable].sort(
    (left, right) => (right.clickcount ?? 0) - (left.clickcount ?? 0),
  )
  const groups = groupStationsByGenre(playable)

  const genres = GENRE_IDS.filter((id) => id !== 'outros').map((id) => ({
    id,
    title: genreName(id),
    kind: 'genre' as const,
    stations: groups[id].slice(0, limit).map(toHomeStation),
  }))

  const regions = REGIONS.map((region) => ({
    id: region.id,
    title: region.name,
    kind: 'region' as const,
    stations: playable
      .filter((station) => stationRegion(station) === region.id)
      .slice(0, limit)
      .map(toHomeStation),
  }))

  return {
    featured: ranked.slice(0, limit).map(toHomeStation),
    genres,
    regions,
    availableGenres: GENRE_IDS.map((id) => ({ id, name: genreName(id) })),
  }
}
