import { describe, expect, it, vi } from 'vitest'
import { createStreamService } from '../../src/streams/streams.js'
import { top25Ranking } from '../../src/editorial/top-25-ranking.js'
import { validStation } from '../fixtures/station.js'
describe('streams', () => {
  it('prioritizes the resolved direct URL', async () => {
    const station = {
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: validStation.name!,
      url: validStation.url,
      urlResolved: validStation.url_resolved,
      countryCode: 'BR' as const,
      tags: [],
      hls: false,
    }
    const result = await createStreamService({
      searchStations: vi.fn().mockResolvedValue([station]),
    } as never).getStreams({ type: 'tv', id: station.id })
    expect(result.streams[0].url).toBe(validStation.url_resolved)
  })
  it('rejects invalid station IDs', async () => {
    const result = await createStreamService({
      searchStations: vi.fn(),
    } as never).getStreams({ type: 'tv', id: 'invalid' })
    expect(result).toEqual({ streams: [] })
  })

  it('resolves a Top 25 editorial stream through its alias in the complete index', async () => {
    const station = {
      id: 'radio-br:tupi',
      stationUuid: 'tupi',
      name: 'Super Rádio Tupi',
      countryCode: 'BR' as const,
      state: 'RJ',
      tags: [],
      url: 'https://stream.example/tupi',
      hls: false,
    }
    const result = await createStreamService({
      searchStations: vi.fn().mockResolvedValue([]),
      searchAllStations: vi.fn().mockResolvedValue([station]),
    } as never).getStreams({ type: 'tv', id: 'radio-br:editorial:top25-3' })

    expect(top25Ranking[2].name).toBe('Super Rádio Tupi 96.5 FM')
    expect(result).toEqual({
      streams: [{ url: 'https://stream.example/tupi' }],
    })
  })
})
