import { describe, expect, it } from 'vitest'
import {
  genreCover,
  regionCover,
  stateCover,
} from '../../src/catalog/covers.js'

describe('catalog covers', () => {
  it('returns stable local references for genres, regions and states', () => {
    expect(genreCover('sertanejo')).toBe(
      '/assets/collections/genres/sertanejo.svg',
    )
    expect(regionCover('sudeste')).toBe(
      '/assets/collections/regions/sudeste.svg',
    )
    expect(stateCover('SP')).toBe('/assets/collections/states/sp.svg')
  })
})
