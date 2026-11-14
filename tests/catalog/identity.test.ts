import { describe, expect, it } from 'vitest'
import {
  sameStationIdentity,
  stationIdentity,
} from '../../src/catalog/identity.js'
import type { Station } from '../../src/stations/types.js'

function station(name: string, state = 'RJ', city = 'Rio de Janeiro'): Station {
  return {
    id: `radio-br:${name}`,
    stationUuid: name,
    name,
    countryCode: 'BR',
    state,
    city,
    tags: [],
    hls: false,
  }
}

describe('station identity', () => {
  it('treats name and frequency formatting variants as the same station', () => {
    expect(
      sameStationIdentity(
        station('Super Rádio Tupi 96.5 FM'),
        station('Super Radio Tupi 96,5'),
      ),
    ).toBe(true)
  })

  it('does not merge the same brand and frequency in different cities', () => {
    expect(
      sameStationIdentity(
        station('Super Rádio Tupi 96.5 FM'),
        station('Super Radio Tupi 96,5', 'SP', 'São Paulo'),
      ),
    ).toBe(false)
  })

  it('does not merge two explicit frequencies from the same brand and city', () => {
    expect(
      sameStationIdentity(
        station('Rádio Exemplo 96.5 FM'),
        station('Rádio Exemplo 98.1 FM'),
      ),
    ).toBe(false)
  })

  it('exposes a stable normalized identity for logo matching', () => {
    expect(stationIdentity(station('Super Rádio Tupi 96,5 FM'))).toMatchObject({
      brand: 'super tupi',
      frequencies: ['96.5'],
      city: 'rio de janeiro',
      state: 'RJ',
    })
  })
})
