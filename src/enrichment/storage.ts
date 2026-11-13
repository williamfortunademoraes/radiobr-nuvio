import { readFileSync, writeFileSync } from 'node:fs'
import type { EnrichmentSnapshot } from './snapshot.js'
import { serializeSnapshot } from './snapshot.js'

export function loadEnrichmentSnapshot(
  filePath = 'data/enrichment/stations.json',
): EnrichmentSnapshot | undefined {
  try {
    const value: unknown = JSON.parse(readFileSync(filePath, 'utf8'))
    if (!value || typeof value !== 'object') return undefined
    const snapshot = value as EnrichmentSnapshot
    if (snapshot.version !== 1 || !Array.isArray(snapshot.records))
      return undefined
    return snapshot
  } catch {
    return undefined
  }
}

export function writeEnrichmentSnapshot(
  filePath: string,
  snapshot: EnrichmentSnapshot,
): void {
  writeFileSync(filePath, serializeSnapshot(snapshot), 'utf8')
}
