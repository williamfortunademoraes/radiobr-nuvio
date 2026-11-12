export interface RadioBrowserStation {
  stationuuid?: string
  name?: string
  url?: string
  url_resolved?: string
  favicon?: string
  homepage?: string
  countrycode?: string
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
