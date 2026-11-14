import { describe, expect, it, vi } from 'vitest'
import {
  createCatalogService,
  stationPreview,
} from '../../src/catalog/catalog.js'
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
  it.each([
    ['Super Radio Tupi 96.5', 'tupi-96-5.png'],
    ['Antena 1 São Paulo, SP (ZYD823 94,7 MHz FM) [aac]', 'antena-1-94-7.png'],
    ['Rádio BandNews RJ 90.3 FM', 'bandnews-90-3.jpg'],
    ['Bossa Jazz Brasil', 'bossa-jazz-brasil.png'],
    ['Namoro Web Rádio', 'namoro-web-radio.png'],
    ['Piatã FM 94.3', 'piata-fm-94-3.png'],
    ['Piatã FM', 'piata-fm-94-3.png'],
    ['Positividade FM 104.5', 'positividade-fm.png'],
    ['Positividade FM', 'positividade-fm.png'],
    ['Rádio Café Viola', 'radio-cafe-viola.png'],
    ['Rádio Flashback FM', 'flashback.png'],
    ['Rádio Motel', 'radio-motel.jpg'],
    ['Rádio Nova Instrumental', 'radio-nova-instrumental.webp'],
    ['Rádio Disco Funk BR', 'radio-disco-funk-br.jfif'],
    ['Rádio Furacão 2000', 'radio-furacao-2000.jfif'],
    ['98 Rock', 'radio-98-rock.webp'],
    ['105 FM - É só alegria!', 'radio-105-fm.png'],
    ['Clube FM 99.1', 'clube-fm-99-1.webp'],
    ['Cultura Brasil (fm77.9)', 'cultura-brasil-fm-77-9.png'],
    ['R.VALE VERDE FM', 'r-vale-verde-fm.jfif'],
    ['Rádio CBN Campinas 99,1 FM', 'cbn-campinas.png'],
    ['Rádio Forró', 'radio-forro.webp'],
    ['Gospel FM 89.3', 'radio-gospel-fm-89-3.png'],
    ['Máquina do Tempo (Internacional)', 'radio-mpb-maquina-do-tempo.png'],
    ['89 A Rádio Rock Curitiba 89.3 FM', 'radio-89-rock-curitiba.jfif'],
    ['FM O DIA 100.5', 'fm-o-dia-100-5.png'],
    ['CBN São Paulo', 'cbn-sao-paulo.svg'],
    ['Rádio Disney 91.3 FM', 'radio-disney.png'],
    ['Rádio Globo - Rio de Janeiro', 'radio-globo.png'],
    ['Mix Rio 102.1 Rio de Janeiro, RJ', 'mix-rio-102-1.jfif'],
    ['Rádio 105 FM', 'radio-105-fm.jfif'],
    ['Rádio Rock - 89,1 FM', 'radio-89-rock.jfif'],
    ['Jovem Pan FM - Belo Horizonte 99,1', 'jovem-pan-bh-99-1.png'],
    ['Rádio 99.5 FM Goiânia', '99-5-fm-goiania.png'],
    ['Jovem Pan FM Florianópolis', 'jovem-pan-florianopolis-sc.png'],
    ['Rádio Rap Brasil', 'radio-rap-brasil.jpg'],
    ['Rádio Transamérica', 'radio-transamerica.webp'],
    ['Rádio FM O Dia 99.7 Macaé', 'fm-o-dia-99-7-macae.jfif'],
    ['Rádio Animu', 'radio-animu.jfif'],
    ['Rádio Reggae Brasil', 'radio-reggae-brasil.jfif'],
  ])('uses the curated logo for %s', (name, file) => {
    expect(
      stationPreview(
        station('88888888-8888-4888-8888-888888888888', name, ['pop']),
        true,
        'https://radio.example/assets/logo.png',
      ),
    ).toMatchObject({
      poster: `https://radio.example/assets/logos/stations/${file}`,
      posterShape: 'square',
    })
  })

  it.each([
    ['Rádio 106.7 Sertaneja', '106-7-sertaneja.jfif'],
    ['Smooth Jazz Lounge', 'smooth-jazz-lounge.jpg'],
    ['Energia FM (97 FM)', 'energia-fm-97.jfif'],
    ['Kiss FM São Paulo', 'kiss-fm-sao-paulo.jfif'],
    ['Rádio Nova Paradiso 89.5 FM', 'nova-paradiso-89-5.jfif'],
    ['Alpha MPB', 'radio-alpha-mpb.webp'],
    ['Rádio Alvorada FM 94.9', 'radio-alvorada.png'],
    ['Rádio Anos 80', 'radio-anos-80.png'],
    ['BR - The Classic Rock', 'br-classic-rock.png'],
    ['Rádio Buteco Sertanejo', 'buteco-sertanejo.png'],
    ['Rádio Cultura FM 103.1', 'cultura-fm-103-1.webp'],
    ['Geração Samba e Pagode', 'geracao-samba-pagode.png'],
    ['Rádio Jovem Pan FM São Paulo 100.9', 'jovem-pan-sp-100-9.png'],
    ['Maracutaia FM', 'maracutaia-fm.png'],
    ['Rádio Nativa 95.3 São Paulo', 'nativa-sp-95-3.png'],
  ])('uses the fifth selection logo for %s', (name, file) => {
    expect(
      stationPreview(
        station('99999999-9999-4999-8999-999999999999', name, ['radio']),
        true,
        'https://radio.example/assets/logo.png',
      ),
    ).toMatchObject({
      poster: `https://radio.example/assets/logos/stations/${file}`,
      posterShape: 'square',
    })
  })

  it('exposes each genre as a collection of real stations, never collection cards', async () => {
    const catalogIds = buildCatalogs(defaultConfig()).map(
      (catalog) => catalog.id,
    )
    expect(catalogIds).toContain('radio-br-genre-sertanejo')
    expect(catalogIds).not.toContain('radio-br-genres')

    const result = await createCatalogService(client()).getCatalog({
      type: 'tv',
      id: 'radio-br-genre-sertanejo',
    })

    expect(result.metas).toEqual([
      {
        id: sertanejo.id,
        type: 'tv',
        name: 'Rádio Sertanejo',
      },
    ])
  })

  it('keeps only the direct genre and state collection sources in the manifest', () => {
    const ids = buildCatalogs(defaultConfig()).map((catalog) => catalog.id)
    expect(ids).toEqual(
      expect.arrayContaining(['radio-br-genre-sertanejo', 'radio-br-state-am']),
    )
    expect(ids).not.toEqual(
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
    expect(result.metas[6]).toMatchObject({
      poster:
        'https://radio.example/assets/logos/stations/bandnews-sp-96-9.jpg',
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

  it('uses the clean curated logo for Rádio Gaúcha', async () => {
    const result = await createCatalogService(
      client(),
      'https://radio.example/assets/logo.png',
    ).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
      config: defaultConfig(),
    })

    expect(result.metas[0]).toMatchObject({
      poster: 'https://radio.example/assets/logos/stations/gaucha-93-7.png',
      posterShape: 'square',
    })
  })

  it('uses improved curated logos for the other highlighted stations', async () => {
    const result = await createCatalogService(
      client(),
      'https://radio.example/assets/logo.png',
    ).getCatalog({
      type: 'tv',
      id: 'radios-em-destaque',
      config: defaultConfig(),
    })

    expect(result.metas[7]).toMatchObject({
      poster: 'https://radio.example/assets/logos/stations/grenal-95-9.png',
    })
    expect(result.metas[10]).toMatchObject({
      poster: 'https://radio.example/assets/logos/stations/band-96-1.png',
    })
    expect(result.metas[12]).toMatchObject({
      poster: 'https://radio.example/assets/logos/stations/jb-fm-99-9.png',
    })
    expect(result.metas[16]).toMatchObject({
      poster: 'https://radio.example/assets/logos/stations/radio-89-rock.jfif',
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

  it('keeps one canonical Top 25 station and removes same-brand clones', async () => {
    const result = await createCatalogService({
      searchAllStations: vi
        .fn()
        .mockResolvedValue([
          station(
            'a1111111-1111-4111-8111-111111111111',
            'Antena 1 FM 94.7 São Paulo',
            ['pop'],
            20,
            'SP',
          ),
          station(
            'b2222222-2222-4222-8222-222222222222',
            'Rádio Antena 1 - São Paulo (94.7 FM)',
            ['pop'],
            10,
            'SP',
          ),
          station(
            'c3333333-3333-4333-8333-333333333333',
            'Rádio Antena 1 - Porto Alegre',
            ['pop'],
            9,
            'RS',
          ),
        ]),
    } as never).getCatalog({ type: 'tv', id: 'radio-br-catalog' })
    expect(result.metas.map((meta) => meta.name)).toEqual([
      'Antena 1 FM 94.7 São Paulo',
      'Rádio Antena 1 - Porto Alegre',
    ])
  })

  it('deduplicates same brand and frequency within one state', async () => {
    const result = await createCatalogService({
      searchStations: vi
        .fn()
        .mockResolvedValue([
          station(
            'd4444444-4444-4444-8444-444444444444',
            'Kiss FM - 92.5 - São Paulo',
            ['rock'],
            20,
            'SP',
          ),
          station(
            'e5555555-5555-4555-8555-555555555555',
            'Kiss FM São Paulo',
            ['rock'],
            10,
            'SP',
          ),
          station(
            'f6666666-6666-4666-8666-666666666666',
            'Kiss FM 92.5',
            ['rock'],
            5,
            'SP',
          ),
        ]),
    } as never).getCatalog({ type: 'tv', id: 'radio-br-catalog' })
    expect(result.metas.map((meta) => meta.name)).toEqual([
      'Kiss FM - 92.5 - São Paulo',
    ])
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
