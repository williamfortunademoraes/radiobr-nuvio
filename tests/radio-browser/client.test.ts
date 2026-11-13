import { describe, expect, it, vi } from 'vitest'
import { RadioBrowserClient } from '../../src/radio-browser/client.js'
import { validStation } from '../fixtures/station.js'
const response = (body: unknown): Response =>
  new Response(JSON.stringify(body), { status: 200 })
describe('Radio Browser client', () => {
  it('sends Brazilian search parameters and caches results', async () => {
    const fetcher = vi.fn().mockResolvedValue(response([validStation]))
    const client = new RadioBrowserClient(
      {
        radioBrowserBaseUrl: 'https://api.test',
        userAgent: 'RADIO-BR/test',
        cacheTtlMs: 1000,
        port: 7000,
      },
      fetcher,
    )
    await client.searchStations({ search: 'prova', offset: 10, limit: 20 })
    await client.searchStations({ search: 'prova', offset: 10, limit: 20 })
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, init] = fetcher.mock.calls[0]
    expect(url).toContain('countrycode=BR')
    expect(url).toContain('name=prova')
    expect(url).toContain('offset=10')
    expect((init as RequestInit).headers).toMatchObject({
      'User-Agent': 'RADIO-BR/test',
    })
  })
  it('throws on HTTP and invalid JSON errors', async () => {
    await expect(
      new RadioBrowserClient(
        undefined,
        vi.fn().mockResolvedValue(new Response('', { status: 503 })),
      ).searchStations(),
    ).rejects.toThrow('HTTP 503')
    await expect(
      new RadioBrowserClient(
        undefined,
        vi.fn().mockResolvedValue(new Response('{', { status: 200 })),
      ).searchStations(),
    ).rejects.toThrow('invalid JSON')
  })

  it('loads the complete directory in pages and deduplicates station IDs', async () => {
    const page = Array.from({ length: 100 }, (_, index) => ({
      ...validStation,
      stationuuid: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      name: `Rádio ${index + 1}`,
      clickcount: 100 - index,
    }))
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(page))
      .mockResolvedValueOnce(
        response([
          {
            ...validStation,
            stationuuid: '00000000-0000-4000-8000-000000000101',
            name: 'Rádio 101',
            clickcount: 1,
          },
          page[0],
        ]),
      )
    const client = new RadioBrowserClient(
      {
        radioBrowserBaseUrl: 'https://api.test',
        userAgent: 'RADIO-BR/test',
        cacheTtlMs: 1000,
        port: 7000,
      },
      fetcher,
    )

    const stations = await client.searchAllStations()
    expect(stations).toHaveLength(101)
    expect(stations[0].clickcount).toBe(100)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1][0] as string).toContain('offset=100')
  })
})
