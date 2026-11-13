import { loadConfig, type AppConfig } from '../config/index.js'
import { normalizeStation } from '../stations/normalize.js'
import type { Station } from '../stations/types.js'
import type { RadioBrowserStation, SearchOptions } from './types.js'
import { MemoryCache } from './cache.js'

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>
export class RadioBrowserClient {
  private readonly inFlight = new Map<string, Promise<Station[]>>()
  constructor(
    private readonly config: AppConfig = loadConfig(),
    private readonly fetcher: FetchLike = fetch,
    private readonly cache = new MemoryCache<Station[]>(config.cacheTtlMs),
  ) {}
  async searchStations(options: SearchOptions = {}): Promise<Station[]> {
    const limit = Math.min(Math.max(options.limit ?? 100, 1), 100)
    const offset = Math.max(options.offset ?? 0, 0)
    const cacheKey = JSON.stringify({
      search: options.search ?? '',
      offset,
      limit,
    })
    const cached = this.cache.get(cacheKey)
    if (cached) return cached
    const pending = this.inFlight.get(cacheKey)
    if (pending) return pending
    const request = this.fetchStations(options.search, limit, offset).then(
      (stations) => {
        this.cache.set(cacheKey, stations)
        return stations
      },
    )
    this.inFlight.set(cacheKey, request)
    try {
      return await request
    } finally {
      this.inFlight.delete(cacheKey)
    }
  }

  async searchAllStations(): Promise<Station[]> {
    const cacheKey = JSON.stringify({ all: true })
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    const stations: Station[] = []
    for (let offset = 0; ; offset += 100) {
      const page = await this.searchStations({ offset, limit: 100 })
      stations.push(...page)
      if (page.length < 100) break
    }

    const seen = new Set<string>()
    const unique = stations.filter((station) => {
      if (seen.has(station.id)) return false
      seen.add(station.id)
      return true
    })
    const ordered = unique
      .map((station, index) => ({ station, index }))
      .sort((a, b) => {
        const aKnown = typeof a.station.clickcount === 'number'
        const bKnown = typeof b.station.clickcount === 'number'
        if (aKnown !== bKnown) return aKnown ? -1 : 1
        if (!aKnown) return a.index - b.index
        return (b.station.clickcount ?? 0) - (a.station.clickcount ?? 0)
      })
      .map(({ station }) => station)
    this.cache.set(cacheKey, ordered)
    return ordered
  }

  private async fetchStations(
    search: string | undefined,
    limit: number,
    offset: number,
  ): Promise<Station[]> {
    const params = new URLSearchParams({
      countrycode: 'BR',
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      limit: String(limit),
      offset: String(offset),
    })
    if (search?.trim()) params.set('name', search.trim())
    const response = await this.fetcher(
      `${this.config.radioBrowserBaseUrl}/json/stations/search?${params}`,
      {
        headers: {
          'User-Agent': this.config.userAgent,
          Accept: 'application/json',
        },
      },
    )
    if (!response.ok)
      throw new Error(`Radio Browser request failed: HTTP ${response.status}`)
    let data: unknown
    try {
      data = await response.json()
    } catch {
      throw new Error('Radio Browser returned invalid JSON')
    }
    if (!Array.isArray(data))
      throw new Error('Radio Browser returned an invalid station list')
    const stations = data
      .map((item) => normalizeStation(item as RadioBrowserStation))
      .filter((station): station is Station => station !== null)
    return stations
  }
}
