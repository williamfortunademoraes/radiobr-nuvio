import { describe, expect, it } from 'vitest'
import { matchStation } from '../../src/enrichment/identity.js'
import {
  normalizeCategories,
  normalizeEnrichedData,
} from '../../src/enrichment/normalize.js'
import type { Station } from '../../src/stations/types.js'

const station = (overrides: Partial<Station> = {}): Station => ({
  id: 'radio-br:uuid-1',
  stationUuid: 'uuid-1',
  name: 'Rádio Central',
  city: 'Campinas',
  state: 'SP',
  countryCode: 'BR',
  tags: ['pop'],
  homepage: 'https://central.example',
  url: 'https://central.example/stream',
  hls: false,
  ...overrides,
})

describe('enrichment identity', () => {
  it('matches by stable UUID before other identifiers', () => {
    expect(
      matchStation({ stationUuid: 'uuid-1', name: 'Outra Rádio' }, [station()])
        ?.stationUuid,
    ).toBe('uuid-1')
  })

  it('matches by name only when city and state also agree', () => {
    expect(
      matchStation({ name: 'Rádio Central', city: 'Campinas', state: 'SP' }, [
        station(),
      ])?.stationUuid,
    ).toBe('uuid-1')
    expect(matchStation({ name: 'Rádio Central' }, [station()])).toBeUndefined()
  })
})

describe('enrichment normalization', () => {
  it('normalizes UF, state name, city and duplicate categories', () => {
    expect(
      normalizeEnrichedData({
        city: '  São   Paulo ',
        state: 'Sao Paulo',
        categories: ['Pop', 'pop music', ' POP '],
      }),
    ).toEqual({
      city: 'São Paulo',
      state: 'SP',
      stateName: 'São Paulo',
      categories: ['Pop'],
    })
  })

  it('keeps meaningful distinct categories while normalizing case', () => {
    expect(normalizeCategories(['Sertanejo', 'Rock', 'rock'])).toEqual([
      'Sertanejo',
      'Rock',
    ])
  })
})
