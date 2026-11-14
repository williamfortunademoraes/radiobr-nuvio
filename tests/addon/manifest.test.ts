import { describe, expect, it } from 'vitest'
import { manifest } from '../../src/addon/manifest.js'

describe('RADIO BR manifest', () => {
  it('declares the stable addon identity and supported resources', () => {
    expect(manifest).toMatchObject({
      id: 'com.williamfortuna.radio-br',
      version: '0.1.2',
      name: 'Estações de rádios - Brasil',
      resources: ['catalog', 'meta', 'stream'],
      types: ['tv'],
    })
    expect(manifest.catalogs.map((catalog) => catalog.id)).toEqual(
      expect.arrayContaining([
        'radios-em-destaque',
        'radio-br-genre-sertanejo',
        'radio-br-state-sp',
        'radio-br-catalog',
      ]),
    )
  })

  it('exposes direct genre sources instead of the redundant genre filter catalog', () => {
    expect(manifest.catalogs.map((catalog) => catalog.id)).toEqual(
      expect.arrayContaining(['radio-br-genre-sertanejo']),
    )
    expect(manifest.catalogs.map((catalog) => catalog.id)).not.toContain(
      'radio-br-genre',
    )
  })

  it('keeps the main collection names and puts the national catalog last', () => {
    expect(manifest.catalogs.slice(-1)[0]).toMatchObject({
      id: 'radio-br-catalog',
      name: 'Todas as rádios',
    })
    expect(manifest.catalogs[0]).toMatchObject({
      id: 'radios-em-destaque',
      name: 'Rádios em destaque',
    })
  })
})
