export interface Station {
  clickcount?: number
  lastcheckok?: number | string
  sourceName?: string
  id: string
  stationUuid: string
  name: string
  url?: string
  urlResolved?: string
  favicon?: string
  homepage?: string
  slogan?: string
  about?: string
  countryCode: 'BR'
  city?: string
  state?: string
  stateName?: string
  categories?: string[]
  language?: string
  tags: string[]
  codec?: string
  bitrate?: number
  hls: boolean
}

export const stationId = (uuid: string): string => `radio-br:${uuid}`
