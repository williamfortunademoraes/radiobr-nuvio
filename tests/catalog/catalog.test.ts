import { describe, expect, it, vi } from 'vitest'
import { createCatalogService } from '../../src/catalog/catalog.js'
import type { Station } from '../../src/stations/types.js'
import { validStation } from '../fixtures/station.js'

function station(
  uuid: string,
  name: string,
  tags: string[],
  clickcount = 0,
): Station {
  return {
    id: `radio-br:${uuid}`,
    stationUuid: uuid,
    name,
    sourceName: name,
    url: `https://example.test/${uuid}.mp3`,
    urlResolved: `https://example.test/${uuid}-resolved.mp3`,
    countryCode: 'BR',
    tags,
    clickcount,
    hls: false,
  }
}

const noticias = station(
  '11111111-1111-4111-8111-111111111111',
  'Rádio Notícias',
  ['news'],
  10,
)
const sertanejo = station(
  '22222222-2222-4222-8222-222222222222',
  'Rádio Sertanejo',
  ['sertanejo universitário'],
  50,
)
const desconhecida = station(
  '33333333-3333-4333-8333-333333333333',
  'Rádio Sem Gênero',
  ['radio'],
  1,
)
const stations = [noticias, sertanejo, desconhecida]

function client() {
  return {
    searchStations: vi.fn().mockResolvedValue(stations),
  } as never
}

describe('catalog', () => {
  it('generates a TV preview and forwards search/pagination', async () => {
    const searchStations = vi
      .fn()
      .mockResolvedValue([
        { ...validStation, id: `radio-br:${validStation.stationuuid}` },
      ])
    const result = await createCatalogService({
      searchStations,
    } as never).getCatalog({
      type: 'tv',
      id: 'radio-br-catalog',
      extra: { search: 'prova', skip: 100 },
    })
    expect(result.metas[0]).toMatchObject({
      id: `radio-br:${validStation.stationuuid}`,
      type: 'tv',
      name: 'Rádio Prova',
    })
    expect(searchStations).toHaveBeenCalledWith({
      search: 'prova',
      offset: 100,
    })
  })

  it('preserves the general catalog without genre filtering', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-catalog',
    })
    expect(result.metas.map((meta) => meta.name)).toEqual([
      'Rádio Notícias',
      'Rádio Sertanejo',
      'Rádio Sem Gênero',
    ])
  })

  it('preserves the featured catalog ranking', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-featured',
    })
    expect(result.metas[0].id).toBe(sertanejo.id)
  })

  it('returns all stations when the genre catalog has no filter', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-genre',
    })
    expect(result.metas).toHaveLength(3)
  })

  it('filters the genre catalog locally with the requested genre', async () => {
    const radio = client()
    const service = createCatalogService(radio)
    const result = await service.getCatalog({
      type: 'tv',
      id: 'radio-br-genre',
      extra: { genre: 'Sertanejo' },
    })
    expect(result.metas).toEqual([
      {
        id: sertanejo.id,
        type: 'tv',
        name: 'Rádio Sertanejo',
      },
    ])
    expect(
      (radio as { searchStations: ReturnType<typeof vi.fn> }).searchStations,
    ).toHaveBeenCalledTimes(1)
  })

  it('resolves genre options without accents and keeps search working', async () => {
    const radio = client()
    const result = await createCatalogService(radio).getCatalog({
      type: 'tv',
      id: 'radio-br-genre',
      extra: { genre: 'Notícias', search: 'prova' },
    })
    expect(result.metas.map((meta) => meta.name)).toEqual(['Rádio Notícias'])
    expect(
      (radio as { searchStations: ReturnType<typeof vi.fn> }).searchStations,
    ).toHaveBeenCalledWith({ search: 'prova', offset: 0 })
  })

  it('returns no results for an unknown genre instead of ignoring it', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-genre',
      extra: { genre: 'Inexistente' },
    })
    expect(result.metas).toEqual([])
  })

  it('returns no results for an unknown catalog id', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-unknown',
    })
    expect(result.metas).toEqual([])
  })
})
