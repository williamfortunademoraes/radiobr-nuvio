import { describe, expect, it } from 'vitest'
import {
  applyEnrichment,
  resolveEnrichment,
} from '../../src/enrichment/resolve.js'
import type { Station } from '../../src/stations/types.js'

const station: Station = {
  id: 'radio-br:uuid',
  stationUuid: 'uuid',
  name: 'Rádio Antiga',
  city: 'São Paulo',
  state: 'SP',
  countryCode: 'BR',
  tags: ['pop'],
  favicon: 'https://old.example/logo.png',
  url: 'https://old.example/stream',
  urlResolved: 'https://old.example/stream-resolved',
  hls: false,
}

describe('enrichment resolution', () => {
  it('uses source priority and lets newer official data supersede older editorial data', () => {
    const record = resolveEnrichment(station, [
      {
        source: 'radios-com-br',
        data: { city: 'São Paulo', slogan: 'Slogan antigo' },
        provenance: {},
        checkedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        source: 'official-website',
        data: { slogan: 'Slogan atual', categories: ['Pop', 'Rock'] },
        provenance: {},
        checkedAt: '2026-11-01T00:00:00.000Z',
      },
      {
        source: 'radio-browser',
        data: { city: 'Outra cidade', slogan: 'Slogan inferior' },
        provenance: {},
        checkedAt: '2026-11-02T00:00:00.000Z',
      },
    ])

    expect(record.data).toMatchObject({
      city: 'São Paulo',
      slogan: 'Slogan atual',
      categories: ['Pop', 'Rock'],
    })
  })

  it('preserves existing values when no candidate supplies a replacement', () => {
    const record = resolveEnrichment(station, [
      {
        source: 'radio-browser',
        data: { name: 'Rádio Atual' },
        provenance: {},
        checkedAt: '2026-11-01T00:00:00.000Z',
      },
    ])
    expect(record.data.city).toBe('São Paulo')
    expect(record.data.name).toBe('Rádio Atual')
  })

  it('applies enrichment without changing identity or stream URLs', () => {
    const result = applyEnrichment(station, {
      stationUuid: 'uuid',
      data: {
        name: 'Rádio Atual',
        state: 'RJ',
        stateName: 'Rio de Janeiro',
        categories: ['Notícias'],
        slogan: 'A rádio atual',
        logo: 'https://official.example/logo.png',
      },
      provenance: {},
      updatedAt: '2026-11-12T00:00:00.000Z',
    })
    expect(result).toMatchObject({
      id: station.id,
      stationUuid: station.stationUuid,
      url: station.url,
      urlResolved: station.urlResolved,
      name: 'Rádio Atual',
      state: 'RJ',
      stateName: 'Rio de Janeiro',
      categories: ['Notícias'],
      slogan: 'A rádio atual',
      favicon: 'https://official.example/logo.png',
    })
  })
})
