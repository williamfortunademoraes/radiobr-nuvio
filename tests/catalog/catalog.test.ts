import { describe, expect, it, vi } from 'vitest'
import { createCatalogService } from '../../src/catalog/catalog.js'
import { buildCatalogs, defaultConfig } from '../../src/config/addon-config.js'
import type { Station } from '../../src/stations/types.js'
import { validStation } from '../fixtures/station.js'

function station(
  uuid: string,
  name: string,
  tags: string[],
  clickcount = 0,
  state?: string,
): Station {
  return {
    id: `radio-br:${uuid}`,
    stationUuid: uuid,
    name,
    sourceName: name,
    url: `https://example.test/${uuid}.mp3`,
    urlResolved: `https://example.test/${uuid}-resolved.mp3`,
    countryCode: 'BR',
    state,
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
  it('declares grouped region, state and genre catalogs', () => {
    const ids = buildCatalogs(defaultConfig()).map((catalog) => catalog.id)
    expect(ids.filter((id) => id === 'radio-br-region')).toHaveLength(1)
    expect(ids).toEqual(
      expect.arrayContaining([
        'radio-br-region',
        'radio-br-state',
        'radio-br-genre',
      ]),
    )
  })

  it('returns exactly the 25 ordered editorial ranking entries', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
      config: defaultConfig(),
    })
    expect(result.metas).toHaveLength(25)
    expect(result.metas[0].name).toContain('Gaúcha')
    expect(result.metas[24].name).toContain('Liberdade')
  })

  it('does not expose ranking visits on editorial radio cards', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
      config: defaultConfig(),
    })

    expect(
      (result.metas[0] as { description?: string }).description,
    ).not.toContain('visitas')
  })

  it('uses a square fallback poster for editorial cards without a logo', async () => {
    const result = await createCatalogService(
      client(),
      'https://radio.example/assets/logo.png',
    ).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
    })
    expect(result.metas[0]).toMatchObject({
      poster: 'https://radio.example/assets/logo.png',
      posterShape: 'square',
    })
  })

  it('uses the curated logo for a highlighted station when available', async () => {
    const result = await createCatalogService(
      client(),
      'https://radio.example/assets/logo.png',
    ).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
      config: defaultConfig(),
    })

    expect(result.metas[1]).toMatchObject({
      poster:
        'https://radio.example/assets/logos/stations/bandeirantes-107-3.jfif',
      posterShape: 'square',
    })
  })

  it('filters region and state catalogs using explicit state data', async () => {
    const result = await createCatalogService({
      searchStations: vi
        .fn()
        .mockResolvedValue([
          station(
            '44444444-4444-4444-8444-444444444444',
            'Rádio Rio',
            ['rock'],
            5,
            'RJ',
          ),
          station(
            '55555555-5555-4555-8555-555555555555',
            'Rádio Norte',
            ['rock'],
            4,
            'AM',
          ),
        ]),
    } as never).getCatalog({ type: 'tv', id: 'radio-br-region-sudeste' })
    expect(result.metas.map((meta) => meta.name)).toEqual(['Rádio Rio'])
  })

  it('filters grouped region and state catalogs with extras', async () => {
    const radio = createCatalogService({
      searchStations: vi
        .fn()
        .mockResolvedValue([
          station(
            '66666666-6666-4666-8666-666666666666',
            'Rádio Rio',
            ['rock'],
            5,
            'RJ',
          ),
          station(
            '77777777-7777-4777-8777-777777777777',
            'Rádio Norte',
            ['rock'],
            4,
            'AM',
          ),
        ]),
    } as never)
    await expect(
      radio.getCatalog({
        type: 'tv',
        id: 'radio-br-region',
        extra: { region: 'Sudeste' },
      }),
    ).resolves.toMatchObject({ metas: [{ name: 'Rádio Rio' }] })
    await expect(
      radio.getCatalog({
        type: 'tv',
        id: 'radio-br-state',
        extra: { state: 'AM' },
      }),
    ).resolves.toMatchObject({ metas: [{ name: 'Rádio Norte' }] })
  })

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

  it('returns the consolidated news and sports catalog', async () => {
    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-news-sports',
      config: { ...defaultConfig(), c: ['news-sports'] },
    })
    expect(result.metas.map((meta) => meta.id)).toEqual([noticias.id])
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
      extra: { genre: 'Notícias e esportes', search: 'prova' },
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
