import { describe, expect, it, vi } from 'vitest'
import { createMetadataService } from '../../src/metadata/metadata.js'
import { validStation } from '../fixtures/station.js'
describe('metadata', () => {
  it('exposes available station details without inventing fields', async () => {
    const station = {
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      countryCode: 'BR' as const,
      tags: ['news'],
      hls: false,
    }
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([station]),
    } as never).getMetadata({ type: 'tv', id: station.id })
    expect(result.meta).toMatchObject({
      id: station.id,
      name: station.name,
      poster: station.favicon,
    })
    expect((result.meta as { description?: string }).description).toContain(
      'SP',
    )
    await expect(
      createMetadataService({ searchStations: vi.fn() } as never).getMetadata({
        type: 'tv',
        id: 'bad',
      }),
    ).resolves.toEqual({ meta: {} })
  })
})
