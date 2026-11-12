import {
  classifyStationTags,
  GENRE_IDS,
  type GenreId,
} from '../stations/tags.js'
import type { Station } from '../stations/types.js'

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
