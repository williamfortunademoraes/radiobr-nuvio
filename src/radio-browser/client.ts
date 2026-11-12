import { loadConfig, type AppConfig } from '../config/index.js'
import { normalizeStation } from '../stations/normalize.js'
import type { Station } from '../stations/types.js'
import type { RadioBrowserStation, SearchOptions } from './types.js'
import { MemoryCache } from './cache.js'

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>
export class RadioBrowserClient {
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
    const params = new URLSearchParams({
      countrycode: 'BR',
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      limit: String(limit),
      offset: String(offset),
    })
    if (options.search?.trim()) params.set('name', options.search.trim())
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
    this.cache.set(cacheKey, stations)
    return stations
  }
}
