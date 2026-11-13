import { describe, expect, it } from 'vitest'
import { manifest } from '../../src/addon/manifest.js'
import { GENRE_NAMES } from '../../src/stations/tags.js'

describe('RADIO BR manifest', () => {
  it('declares the stable addon identity and supported resources', () => {
    expect(manifest).toMatchObject({
      id: 'com.williamfortuna.radio-br',
      version: '0.1.0',
      name: 'Estações de rádios - Brasil',
      resources: ['catalog', 'meta', 'stream'],
      types: ['tv'],
    })
    expect(manifest.catalogs).toEqual(
      expect.arrayContaining([
        {
          type: 'tv',
          id: 'radio-br-genres',
          name: 'Gêneros Musicais',
          extra: expect.any(Array),
        },
        {
          type: 'tv',
          id: 'radio-br-regions',
          name: 'Regiões',
          extra: expect.any(Array),
        },
        {
          type: 'tv',
          id: 'radio-br-featured',
          name: 'Rádios em destaque',
          extra: expect.any(Array),
        },
        {
          type: 'tv',
          id: 'radio-br-genre',
          name: 'Rádios por gênero',
          extra: expect.any(Array),
        },
        {
          type: 'tv',
          id: 'radio-br-catalog',
          name: 'Rádios do Brasil',
          extra: expect.any(Array),
        },
      ]),
    )
  })

  it('declares every genre category as a filter option', () => {
    const genreCatalog = manifest.catalogs.find(
      (catalog) => catalog.id === 'radio-br-genre',
    )
    expect(genreCatalog?.extra).toEqual([
      { name: 'genre', isRequired: false, options: GENRE_NAMES },
      { name: 'search', isRequired: false },
    ])
  })
})
