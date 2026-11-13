export interface RadioBrowserStation {
  clickcount?: number
  stationuuid?: string
  name?: string
  url?: string
  url_resolved?: string
  favicon?: string
  homepage?: string
  slogan?: string
  countrycode?: string
  city?: string
  state?: string
  language?: string
  tags?: string
  codec?: string
  bitrate?: number
  hls?: number
  lastcheckok?: number | string
}

export interface SearchOptions {
  search?: string
  offset?: number
  limit?: number
}
