import type { Station } from '../../stations/types.js'
import type {
  EnrichedStationData,
  EnrichmentField,
  FieldProvenance,
} from '../types.js'

export interface EnrichmentCandidate {
  data: EnrichedStationData
  provenance: Partial<Record<EnrichmentField, FieldProvenance>>
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
      logo: station.favicon,
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
    return { data, provenance }
  }
}
