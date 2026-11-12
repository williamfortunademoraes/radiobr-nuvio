import { describe, expect, it, vi } from 'vitest'
import { createAddon } from '../../src/addon/create-addon.js'
import { validStation } from '../fixtures/station.js'

describe('addon handlers', () => {
  it('connects catalog, genre, metadata and stream flows', async () => {
    const station = {
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: validStation.name!,
      sourceName: validStation.name!,
      url: validStation.url,
      urlResolved: validStation.url_resolved,
      countryCode: 'BR' as const,
      tags: ['news'],
      clickcount: 5,
      lastcheckok: 1,
      hls: false,
    }
    const addon = createAddon({
      searchStations: vi.fn().mockResolvedValue([station]),
    } as never)

    expect(
      ((await addon.get('catalog', 'tv', 'radio-br-catalog', {})) as any).metas,
    ).toHaveLength(1)
    expect(
      ((await addon.get('catalog', 'tv', 'radio-br-featured', {})) as any)
        .metas,
    ).toHaveLength(1)
    expect(
      (
        (await addon.get('catalog', 'tv', 'radio-br-genre', {
          genre: 'Notícias',
        })) as any
      ).metas,
    ).toHaveLength(1)
    expect(
      (
        (await addon.get('catalog', 'tv', 'radio-br-genre', {
          genre: 'Rock',
        })) as any
      ).metas,
    ).toHaveLength(0)
    expect(((await addon.get('meta', 'tv', station.id)) as any).meta.name).toBe(
      station.name,
    )
    expect(
      ((await addon.get('stream', 'tv', station.id)) as any).streams[0].url,
    ).toBe(station.urlResolved)
  })
})
