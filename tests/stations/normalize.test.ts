import { describe, expect, it } from 'vitest'
import { validStation } from '../fixtures/station.js'
import { normalizeStation, stationId } from '../../src/stations/normalize.js'
describe('station normalization', () => {
  it('normalizes a valid Brazilian station', () => {
    const station = normalizeStation(validStation)
    expect(station).toMatchObject({
      id: stationId(validStation.stationuuid!),
      name: 'Rádio Prova',
      countryCode: 'BR',
      tags: ['news', 'brazil'],
      urlResolved: validStation.url_resolved,
    })
  })
  it('preserves an explicit city without inventing one', () => {
    expect(
      normalizeStation({ ...validStation, city: 'Rio de Janeiro' }),
    ).toMatchObject({ city: 'Rio de Janeiro' })
    expect(normalizeStation(validStation)?.city).toBeUndefined()
  })
  it('rejects non-Brazilian, broken, and URL-less stations', () => {
    expect(normalizeStation({ ...validStation, countrycode: 'PT' })).toBeNull()
    expect(normalizeStation({ ...validStation, lastcheckok: 0 })).toBeNull()
    expect(
      normalizeStation({ ...validStation, url: '', url_resolved: '' }),
    ).toBeNull()
  })
})
