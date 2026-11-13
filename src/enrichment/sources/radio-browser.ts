import type { Station } from '../../stations/types.js'
import type {
  EnrichedStationData,
  EnrichmentField,
  EnrichmentSource,
  FieldProvenance,
} from '../types.js'

export interface EnrichmentCandidate {
  source: EnrichmentSource
  data: EnrichedStationData
  provenance: Partial<Record<EnrichmentField, FieldProvenance>>
  checkedAt: string
}

export class RadioBrowserEnrichmentAdapter {
  lookup(
    station: Station,
    checkedAt = new Date().toISOString(),
  ): EnrichmentCandidate {
    const data: EnrichedStationData = {
      name: station.name,
      city: station.city,
      state: station.state,
      categories: station.tags.length ? station.tags : undefined,
    }
    const provenance = Object.fromEntries(
      Object.keys(data).map((field) => [
        field,
        {
          source: 'radio-browser',
          url: station.homepage,
          checkedAt,
          status: 'verified',
        },
      ]),
    ) as Partial<Record<EnrichmentField, FieldProvenance>>
    return { source: 'radio-browser', data, provenance, checkedAt }
  }
}
