import { describe, expect, it } from 'vitest'
import { buildHomePortalData } from '../../src/web/home-data.js'
import { normalizeStation } from '../../src/stations/normalize.js'
import { validStation } from '../fixtures/station.js'
import { top25Ranking } from '../../src/editorial/top-25-ranking.js'

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
    expect(data.regions.find((section) => section.id === 'SP')?.stations).toHaveLength(1)
    expect(data.regions.find((section) => section.id === 'RJ')?.stations).toHaveLength(1)
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

  it('uses the editorial top 25 ranking for featured stations', () => {
    const data = buildHomePortalData(
      top25Ranking.map((entry, index) =>
        station({
          stationuuid: `top-${index}`,
          name: entry.name,
          state: entry.location.split('/').at(-1),
          clickcount: top25Ranking.length - index,
        }),
      ),
    )

    expect(data.featured).toHaveLength(25)
    expect(data.featured.map((item) => item.name)).toEqual(
      top25Ranking.map((entry) => entry.name),
    )
  })

  it('groups states into five population highlights and one compact remainder', () => {
    const data = buildHomePortalData([
      station({ stationuuid: 'sp', state: 'SP' }),
      station({ stationuuid: 'mg', state: 'MG' }),
      station({ stationuuid: 'rj', state: 'RJ' }),
      station({ stationuuid: 'ba', state: 'BA' }),
      station({ stationuuid: 'pr', state: 'PR' }),
      station({ stationuuid: 'sc', state: 'SC' }),
    ])

    expect(data.regions.map((section) => section.id)).toEqual([
      'SP',
      'MG',
      'RJ',
      'BA',
      'PR',
      'outros-estados',
    ])
    expect(data.regions.at(-1)?.stations).toHaveLength(1)
  })
})
