import {
  classifyStationTags,
  GENRE_IDS,
  type GenreId,
} from '../stations/tags.js'
import type { Station } from '../stations/types.js'
import {
  BRAZILIAN_STATES,
  normalizeBrazilianState,
  type StateId,
} from '../stations/locations.js'

export type GenreGroups = Record<GenreId, Station[]>

const groupingCache = new WeakMap<readonly Station[], GenreGroups>()

export function groupStationsByGenre(
  stations: readonly Station[],
): GenreGroups {
  const cached = groupingCache.get(stations)
  if (cached) return cached

  const groups = Object.fromEntries(
    GENRE_IDS.map((genre) => [genre, [] as Station[]]),
  ) as GenreGroups

  for (const station of stations) {
    const { genres, hasIdentifiableTag } = classifyStationTags(station.tags)
    if (genres.length > 0) {
      for (const genre of genres) groups[genre].push(station)
    } else {
      groups[hasIdentifiableTag ? 'outros' : 'nao-informado'].push(station)
    }
  }

  groupingCache.set(stations, groups)
  return groups
}

export type StateGroups = Record<StateId, Station[]>

export function groupStationsByState(
  stations: readonly Station[],
): StateGroups {
  const groups = Object.fromEntries(
    BRAZILIAN_STATES.map(({ id }) => [id, [] as Station[]]),
  ) as StateGroups
  const seen = new Set<string>()
  for (const station of stations) {
    if (seen.has(station.stationUuid)) continue
    const state = normalizeBrazilianState(station.state)
    if (state) groups[state].push(station)
    seen.add(station.stationUuid)
  }
  return groups
}
