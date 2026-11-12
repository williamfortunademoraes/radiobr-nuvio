export interface Station {
  id: string
  stationUuid: string
  name: string
  url?: string
  urlResolved?: string
  favicon?: string
  homepage?: string
  countryCode: 'BR'
  state?: string
  language?: string
  tags: string[]
  codec?: string
  bitrate?: number
  hls: boolean
}

export const stationId = (uuid: string): string => `radio-br:${uuid}`
