import { normalizeState } from '../stations/states.js'
import type { Station } from '../stations/types.js'

export interface StationReference {
  stationUuid?: string
  officialUrl?: string
  name?: string
  city?: string
  state?: string
}

function normalize(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function sameUrl(left?: string, right?: string): boolean {
  return Boolean(left && right && normalize(left) === normalize(right))
}

export function matchStation(
  reference: StationReference,
  stations: readonly Station[],
): Station | undefined {
  if (reference.stationUuid) {
    const byUuid = stations.find(
      (station) => station.stationUuid === reference.stationUuid,
    )
    if (byUuid) return byUuid
  }
  if (reference.officialUrl) {
    const byUrl = stations.find((station) =>
      sameUrl(station.homepage, reference.officialUrl),
    )
    if (byUrl) return byUrl
  }
  if (!reference.name || !reference.city || !reference.state) return undefined
  const state = normalizeState(reference.state)
  if (!state) return undefined
  const name = normalize(reference.name)
  const city = normalize(reference.city)
  return stations.find(
    (station) =>
      normalize(station.name) === name &&
      normalize(station.city) === city &&
      normalizeState(station.state) === state,
  )
}
