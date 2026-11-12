import { describe, expect, it, vi } from 'vitest'
import { createCatalogService } from '../../src/catalog/catalog.js'
import { validStation } from '../fixtures/station.js'
describe('catalog', () => {
  it('generates a TV preview and forwards search/pagination', async () => {
    const client = {
      searchStations: vi
        .fn()
        .mockResolvedValue([
          { ...validStation, id: `radio-br:${validStation.stationuuid}` },
        ]),
    } as never
    const result = await createCatalogService(client).getCatalog({
      type: 'tv',
      id: 'radio-br-catalog',
      extra: { search: 'prova', skip: 100 },
    })
    expect(result.metas[0]).toMatchObject({
      id: `radio-br:${validStation.stationuuid}`,
      type: 'tv',
      name: 'Rádio Prova',
    })
    expect(
      (client as { searchStations: ReturnType<typeof vi.fn> }).searchStations,
    ).toHaveBeenCalledWith({ search: 'prova', offset: 100 })
  })
})
