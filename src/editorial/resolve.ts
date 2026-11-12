import type { EditorialRadio, ResolvedEditorialRadio } from './types.js'
import type { Station } from '../stations/types.js'

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '')

export function resolveEditorialStations(
  editorial: readonly EditorialRadio[],
  stations: readonly Station[],
): ResolvedEditorialRadio[] {
  const used = new Set<string>()
  return editorial.map((item) => {
    const station = stations.find((candidate) => {
      if (used.has(candidate.id)) return false
      return item.stationId === candidate.id || normalize(item.name) === normalize(candidate.name)
    })
    if (station) used.add(station.id)
    return { editorial: item, station, playable: Boolean(station?.urlResolved || station?.url) }
  })
}
