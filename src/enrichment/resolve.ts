import { normalizeEnrichedData } from './normalize.js'
import type { EnrichmentRecord, EnrichmentSource } from './types.js'
import type { EnrichmentSnapshot } from './snapshot.js'
import type { Station } from '../stations/types.js'

export interface ResolutionCandidate {
  source: EnrichmentSource
  data: EnrichmentRecord['data']
  provenance: EnrichmentRecord['provenance']
  checkedAt: string
}

const priority: Record<EnrichmentSource, number> = {
  'radios-com-br': 4,
  'official-website': 3,
  'radio-browser': 2,
  public: 1,
  user: 5,
}

function fields(record: EnrichmentRecord['data']): string[] {
  return Object.keys(record)
}

function pick(
  field: string,
  candidates: readonly ResolutionCandidate[],
): ResolutionCandidate | undefined {
  return [...candidates]
    .filter(
      (candidate) =>
        candidate.data[field as keyof typeof candidate.data] !== undefined,
    )
    .sort((left, right) => {
      const officialIsNewer =
        left.source === 'official-website' &&
        right.source === 'radios-com-br' &&
        left.checkedAt > right.checkedAt
      const officialRightIsNewer =
        right.source === 'official-website' &&
        left.source === 'radios-com-br' &&
        right.checkedAt > left.checkedAt
      if (officialIsNewer) return -1
      if (officialRightIsNewer) return 1
      const sourceDifference = priority[right.source] - priority[left.source]
      if (sourceDifference) return sourceDifference
      return right.checkedAt.localeCompare(left.checkedAt)
    })[0]
}

export function resolveEnrichment(
  station: Station,
  candidates: readonly ResolutionCandidate[],
  updatedAt = new Date().toISOString(),
): EnrichmentRecord {
  const normalizedCandidates = candidates.map((candidate) => ({
    ...candidate,
    data: normalizeEnrichedData(candidate.data),
  }))
  const existing = normalizeEnrichedData({
    name: station.name,
    city: station.city,
    state: station.state,
    stateName: station.stateName,
    categories: station.categories ?? station.tags,
    slogan: station.slogan,
    about: station.about,
    logo: station.favicon,
  })
  const data: EnrichmentRecord['data'] = { ...existing }
  const provenance: EnrichmentRecord['provenance'] = {}
  const candidateFields = normalizedCandidates.flatMap((candidate) =>
    fields(candidate.data),
  )
  for (const field of new Set([...fields(existing), ...candidateFields])) {
    const selected = pick(field, normalizedCandidates)
    if (!selected) continue
    const value = selected.data[field as keyof typeof selected.data]
    if (value !== undefined) data[field as keyof typeof data] = value as never
    const source =
      selected.provenance[field as keyof typeof selected.provenance]
    provenance[field as keyof typeof provenance] = source ?? {
      source: selected.source,
      checkedAt: selected.checkedAt,
      status: 'verified',
    }
  }
  return { stationUuid: station.stationUuid, data, provenance, updatedAt }
}

export function applyEnrichment(
  station: Station,
  record: EnrichmentRecord,
): Station {
  return {
    ...station,
    ...(record.data.name ? { name: record.data.name } : {}),
    ...(record.data.city ? { city: record.data.city } : {}),
    ...(record.data.state ? { state: record.data.state } : {}),
    ...(record.data.stateName ? { stateName: record.data.stateName } : {}),
    ...(record.data.categories ? { categories: record.data.categories } : {}),
    ...(record.data.slogan ? { slogan: record.data.slogan } : {}),
    ...(record.data.about ? { about: record.data.about } : {}),
    ...(record.data.website ? { homepage: record.data.website } : {}),
    ...(record.data.logo ? { favicon: record.data.logo } : {}),
  }
}

export function applySnapshot(
  stations: Station[],
  snapshot?: EnrichmentSnapshot,
): Station[] {
  if (!snapshot) return stations
  const records = new Map(
    snapshot.records.map((record) => [record.stationUuid, record]),
  )
  return stations.map((station) => {
    const record = records.get(station.stationUuid)
    return record ? applyEnrichment(station, record) : station
  })
}
