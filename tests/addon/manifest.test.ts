import { describe, expect, it } from 'vitest'
import { manifest } from '../../src/addon/manifest.js'

describe('RADIO BR manifest', () => {
  it('declares the stable addon identity and supported resources', () => {
    expect(manifest).toMatchObject({
      id: 'com.williamfortuna.radio-br',
      version: '0.1.0',
      name: 'RADIO BR',
      resources: ['catalog', 'meta', 'stream'],
      types: ['tv'],
      catalogs: [
        { type: 'tv', id: 'radio-br-catalog', name: 'Rádios do Brasil' },
      ],
    })
  })
})
