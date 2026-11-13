import { describe, expect, it } from 'vitest'
import {
  REGIONS,
  STATES,
  regionForState,
  statesForRegion,
  stationRegion,
} from '../../src/catalog/geography.js'
import type { Station } from '../../src/stations/types.js'

describe('catalog geography', () => {
  it('contains five regions and all 27 Brazilian federative units', () => {
    expect(REGIONS.map((region) => region.id)).toEqual([
      'norte',
      'nordeste',
      'centro-oeste',
      'sudeste',
      'sul',
    ])
    expect(STATES).toHaveLength(27)
    expect(new Set(STATES.map((state) => state.code)).size).toBe(27)
    expect(STATES.find((state) => state.code === 'SP')).toMatchObject({
      name: 'São Paulo',
      ibgeCode: '35',
      region: 'sudeste',
    })
  })

  it('maps states to regions and never infers a region from a city-only value', () => {
    expect(statesForRegion('sudeste').map((state) => state.code)).toEqual([
      'ES',
      'MG',
      'RJ',
      'SP',
    ])
    expect(regionForState('RJ')).toBe('sudeste')
    expect(stationRegion({ state: 'São Paulo' } as Station)).toBe('sudeste')
    expect(stationRegion({ state: 'Santos' } as Station)).toBeUndefined()
  })
})
