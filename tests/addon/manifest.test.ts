import { describe, expect, it } from 'vitest'
import { manifest } from '../../src/addon/manifest.js'

describe('RADIO BR manifest', () => {
  it('declares the stable addon identity and supported resources', () => {
    expect(manifest).toMatchObject({
      id: 'com.williamfortuna.radio-br',
      version: '0.1.6',
      name: 'Estações de rádios - Brasil',
      resources: ['catalog', 'meta', 'stream'],
      types: ['tv'],
    })
  })

  it('exposes only the two main collections on a default install', () => {
    expect(manifest.catalogs.map((catalog) => catalog.id)).toEqual([
      'radios-em-destaque',
      'radio-br-catalog',
    ])
  })

  it('does not expose genre or state sources on a default install', () => {
    const ids = manifest.catalogs.map((catalog) => catalog.id)
    expect(ids).not.toEqual(
      expect.arrayContaining([
        'radio-br-genre',
        'radio-br-genre-sertanejo',
        'radio-br-region',
        'radio-br-state',
        'radio-br-state-sp',
      ]),
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
