import type { Station } from '../stations/types.js'

export interface EditorialRadio {
  id: string
  name: string
  category: string
  logoUrl?: string
  logoSource?: string
  websiteUrl?: string
  frequency?: string
  city?: string
  state?: string
  sourceUrl: string
  stationId?: string
  streamUrl?: string
}

export interface EditorialCollection {
  id: 'radios-em-destaque'
  name: string
  type: 'editorial'
  scope: 'national-and-regional'
  ordering: 'manual'
  enabled: boolean
  showOnHome: boolean
  items: readonly EditorialRadio[]
}

export interface ResolvedEditorialRadio {
  editorial: EditorialRadio
  station?: Station
  playable: boolean
}
