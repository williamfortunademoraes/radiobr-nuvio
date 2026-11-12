import { expect, it } from 'vitest'
import { rankFeaturedStations } from '../../src/catalog/ranking.js'
import type { Station } from '../../src/stations/types.js'
const base: Station = {
  id: 'radio-br:11111111-1111-4111-8111-111111111111',
  stationUuid: '11111111-1111-4111-8111-111111111111',
  name: 'Teste',
  sourceName: 'Teste',
  countryCode: 'BR',
  url: 'https://example.test/audio',
  tags: [],
  hls: false,
}
it.each([
  { countryCode: 'PT' },
  { stationUuid: 'invalid' },
  { sourceName: '' },
  { url: '' },
  { url: 'javascript:bad' },
  { lastcheckok: 0 },
  { lastcheckok: '0' },
])('rejects invalid candidate %j', (change) => {
  expect(rankFeaturedStations([{ ...base, ...change } as Station])).toEqual([])
})
it('accepts absent availability and popularity', () =>
  expect(rankFeaturedStations([base])).toEqual([base]))
it('deduplicates UUID', () =>
  expect(rankFeaturedStations([base, base])).toHaveLength(1))
it.each([
  { clickcount: 5 },
  { lastcheckok: 1 },
  { favicon: 'https://example.test/logo' },
  { urlResolved: 'https://example.test/resolved' },
])('prefers ranking signal %j', (signal) => {
  const preferred = {
    ...base,
    stationUuid: '22222222-2222-4222-8222-222222222222',
    ...signal,
  }
  expect(rankFeaturedStations([base, preferred])[0]).toEqual(preferred)
})
it('breaks ties by UUID', () => {
  const other = { ...base, stationUuid: '22222222-2222-4222-8222-222222222222' }
  expect(rankFeaturedStations([other, base])).toEqual([base, other])
})
