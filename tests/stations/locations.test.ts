import { describe, expect, it } from 'vitest'
import {
  BRAZILIAN_REGIONS,
  BRAZILIAN_STATES,
  normalizeBrazilianState,
  statesForRegion,
} from '../../src/stations/locations.js'

describe('Brazilian locations', () => {
  it('contains five regions and all 27 federative units', () => {
    expect(BRAZILIAN_REGIONS).toHaveLength(5)
    expect(BRAZILIAN_STATES).toHaveLength(27)
    expect(new Set(BRAZILIAN_STATES.map((state) => state.id)).size).toBe(27)
  })

  it.each([
    ['São Paulo', 'SP'],
    ['sp', 'SP'],
    ['Distrito Federal', 'DF'],
    ['Brasília', 'DF'],
    ['Amapá', 'AP'],
  ])('normalizes %s to %s', (value, expected) =>
    expect(normalizeBrazilianState(value)).toBe(expected),
  )

  it('does not infer unknown locations', () => {
    expect(normalizeBrazilianState('Litoral')).toBeUndefined()
    expect(normalizeBrazilianState()).toBeUndefined()
  })

  it('maps the South region to its three states', () => {
    expect(statesForRegion('sul')).toEqual(['PR', 'RS', 'SC'])
  })
})
