import { describe, expect, it, vi } from 'vitest'
import { createStreamService } from '../../src/streams/streams.js'
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
})
