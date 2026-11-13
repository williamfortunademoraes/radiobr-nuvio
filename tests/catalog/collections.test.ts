import { describe, expect, it } from 'vitest'
import {
  genreCollections,
  regionCollections,
  stateCollections,
} from '../../src/catalog/collections.js'

describe('collection cards', () => {
  it('provides 18 genre cards with square covers', () => {
    const cards = genreCollections()
    expect(cards).toHaveLength(18)
    expect(new Set(cards.map((card) => card.id)).size).toBe(18)
    expect(
      cards.every(
        (card) =>
          card.posterShape === 'square' &&
          card.poster.includes('/genre.svg?collection='),
      ),
    ).toBe(true)
  })

  it('provides regions and states with stable IDs', () => {
    expect(regionCollections()).toHaveLength(5)
    expect(stateCollections('sudeste').map((card) => card.id)).toEqual([
      'radio-br-state-ES',
      'radio-br-state-MG',
      'radio-br-state-RJ',
      'radio-br-state-SP',
    ])
  })
})
