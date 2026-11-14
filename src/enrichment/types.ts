export type EnrichmentSource =
  'radios-com-br' | 'official-website' | 'radio-browser' | 'public' | 'user'

export type EnrichmentField =
  | 'name'
  | 'city'
  | 'state'
  | 'stateName'
  | 'categories'
  | 'slogan'
  | 'about'
  | 'website'
  | 'radiosComBrUrl'
  | 'logo'

export interface EnrichedStationData {
  name?: string
  city?: string
  state?: string
  stateName?: string
  categories?: string[]
  slogan?: string
  about?: string
  website?: string
  radiosComBrUrl?: string
  logo?: string
}

export interface FieldProvenance {
  source: EnrichmentSource
  url?: string
  checkedAt: string
  status: 'verified' | 'not-found' | 'error'
  note?: string
}

export interface EnrichmentRecord {
  stationUuid: string
  data: EnrichedStationData
  provenance: Partial<Record<EnrichmentField, FieldProvenance>>
  updatedAt: string
}

export interface EnrichmentFailure {
  source: EnrichmentSource
  stationUuid?: string
  url?: string
  error: string
}
