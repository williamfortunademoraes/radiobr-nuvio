import { describe, expect, it } from 'vitest'
import { buildHomePortalData } from '../../src/web/home-data.js'
import { normalizeStation } from '../../src/stations/normalize.js'
import { validStation } from '../fixtures/station.js'

function station(overrides: Record<string, unknown> = {}) {
  const result = normalizeStation({
    ...validStation,
    stationuuid: `uuid-${Math.random()}`,
    name: 'Rádio Teste',
    url: 'https://stream.example/radio.mp3',
    url_resolved: 'https://stream.example/radio.mp3',
    clickcount: 10,
    state: 'SP',
    tags: 'rock, pop',
    ...overrides,
  })
  if (!result) throw new Error('fixture should normalize')
  return result
}

describe('buildHomePortalData', () => {
  it('preserves playable station metadata and groups sections', () => {
    const data = buildHomePortalData([
      station({ stationuuid: 'one', name: 'Rádio São Paulo' }),
      station({
        stationuuid: 'two',
        name: 'Rádio Rio',
        state: 'RJ',
        tags: 'sertanejo',
      }),
    ])

    expect(data.featured.map((item) => item.name)).toEqual([
      'Rádio São Paulo',
      'Rádio Rio',
    ])
    expect(
      data.genres.find((section) => section.id === 'rock')?.stations,
    ).toHaveLength(1)
    expect(
      data.regions.find((section) => section.id === 'sudeste')?.stations,
    ).toHaveLength(2)
    expect(data.featured[0]).toMatchObject({
      id: expect.any(String),
      stationUuid: 'one',
      url: 'https://stream.example/radio.mp3',
      state: 'SP',
    })
  })

  it('deduplicates stations and excludes stations without a stream', () => {
    const duplicate = station({ stationuuid: 'same' })
    const noStream = {
      ...station({ stationuuid: 'none' }),
      url: '',
      urlResolved: '',
    }
    const data = buildHomePortalData([duplicate, duplicate, noStream])

    expect(data.featured).toHaveLength(1)
    expect(data.featured.every((item) => item.url || item.urlResolved)).toBe(
      true,
    )
  })

  it('limits each section to the requested maximum', () => {
    const data = buildHomePortalData(
      Array.from({ length: 6 }, (_, index) =>
        station({ stationuuid: `station-${index}`, clickcount: 100 - index }),
      ),
      3,
    )

    expect(data.featured).toHaveLength(3)
    expect(data.genres.every((section) => section.stations.length <= 3)).toBe(
      true,
    )
    expect(data.regions.every((section) => section.stations.length <= 3)).toBe(
      true,
    )
  })
})
