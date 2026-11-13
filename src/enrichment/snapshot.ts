import type {
  EnrichedStationData,
  EnrichmentFailure,
  EnrichmentRecord,
} from './types.js'

export interface EnrichmentSnapshot {
  version: 1
  generatedAt: string
  records: EnrichmentRecord[]
  failures: EnrichmentFailure[]
}

function mergeData(
  previous: EnrichedStationData,
  incoming: EnrichedStationData,
): EnrichedStationData {
  return { ...previous, ...incoming }
}

export function mergeSnapshot(
  previous: EnrichmentSnapshot | undefined,
  incoming: EnrichmentSnapshot,
): EnrichmentSnapshot {
  const byUuid = new Map(
    (previous?.records ?? []).map((record) => [record.stationUuid, record]),
  )
  for (const record of incoming.records) {
    const old = byUuid.get(record.stationUuid)
    byUuid.set(record.stationUuid, {
      ...record,
      data: mergeData(old?.data ?? {}, record.data),
      provenance: { ...old?.provenance, ...record.provenance },
    })
  }
  return {
    version: 1,
    generatedAt: incoming.generatedAt,
    records: [...byUuid.values()].sort((a, b) =>
      a.stationUuid.localeCompare(b.stationUuid),
    ),
    failures: incoming.failures,
  }
}

export function serializeSnapshot(snapshot: EnrichmentSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`
}
