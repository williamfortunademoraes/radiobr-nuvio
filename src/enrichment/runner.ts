import { RadioBrowserEnrichmentAdapter } from './sources/radio-browser.js'
import { resolveEnrichment, type ResolutionCandidate } from './resolve.js'
import { mergeSnapshot, type EnrichmentSnapshot } from './snapshot.js'
import type { EnrichmentFailure } from './types.js'
import type { Station } from '../stations/types.js'

export interface EnrichmentRunOptions {
  stations: readonly Station[]
  lookup?: (station: Station) => Promise<
    | readonly ResolutionCandidate[]
    | {
        candidates: readonly ResolutionCandidate[]
        failures: EnrichmentFailure[]
      }
  >
  concurrency?: number
  now?: string
  previous?: EnrichmentSnapshot
}

export interface EnrichmentRunReport {
  snapshot: EnrichmentSnapshot
  processed: number
  failed: number
}

export async function runEnrichment(
  options: EnrichmentRunOptions,
): Promise<EnrichmentRunReport> {
  const now = options.now ?? new Date().toISOString()
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 4, 16))
  const unique = [
    ...new Map(
      options.stations.map((station) => [station.stationUuid, station]),
    ).values(),
  ]
  const records = [] as EnrichmentSnapshot['records']
  const failures: EnrichmentSnapshot['failures'] = []
  const adapter = new RadioBrowserEnrichmentAdapter()
  let cursor = 0

  const worker = async () => {
    for (;;) {
      const index = cursor++
      const station = unique[index]
      if (!station) return
      try {
        const lookupResult = options.lookup
          ? await options.lookup(station)
          : [adapter.lookup(station, now)]
        const candidates =
          'candidates' in lookupResult ? lookupResult.candidates : lookupResult
        if ('candidates' in lookupResult)
          failures.push(...lookupResult.failures)
        records.push(resolveEnrichment(station, candidates, now))
      } catch (error) {
        records.push(resolveEnrichment(station, [], now))
        failures.push({
          source: 'official-website',
          stationUuid: station.stationUuid,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, unique.length) }, () =>
      worker(),
    ),
  )
  records.sort((left, right) =>
    left.stationUuid.localeCompare(right.stationUuid),
  )
  failures.sort((left, right) =>
    `${left.stationUuid ?? ''}${left.source}`.localeCompare(
      `${right.stationUuid ?? ''}${right.source}`,
    ),
  )
  const snapshot = mergeSnapshot(options.previous, {
    version: 1,
    generatedAt: now,
    records,
    failures,
  })
  return {
    snapshot,
    processed: unique.length,
    failed: failures.length,
  }
}
