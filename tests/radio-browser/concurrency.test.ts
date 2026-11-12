import { expect, it, vi } from 'vitest'
import { RadioBrowserClient } from '../../src/radio-browser/client.js'
import { validStation } from '../fixtures/station.js'
import { MemoryCache } from '../../src/radio-browser/cache.js'
import { loadConfig } from '../../src/config/index.js'

it('shares an in-flight request across simultaneous catalogs and expires by TTL', async () => {
  let now = 0
  const fetcher = vi.fn(
    async () => new Response(JSON.stringify([validStation])),
  )
  const client = new RadioBrowserClient(
    loadConfig(),
    fetcher,
    new MemoryCache(100, () => now),
  )
  const [first, second] = await Promise.all([
    client.searchStations(),
    client.searchStations(),
  ])
  expect(first).toBe(second)
  expect(fetcher).toHaveBeenCalledTimes(1)
  now = 101
  expect(await client.searchStations()).toEqual(first)
  expect(fetcher).toHaveBeenCalledTimes(2)
})
it('allows retry after an upstream failure', async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(new Response(JSON.stringify([validStation])))
  const client = new RadioBrowserClient(loadConfig(), fetcher)
  await expect(client.searchStations()).rejects.toThrow('offline')
  expect(await client.searchStations()).toHaveLength(1)
})
