import { describe, expect, it } from 'vitest'
import { loadEnrichmentSnapshot } from '../../src/enrichment/storage.js'

describe('enrichment storage', () => {
  it('returns undefined when the optional snapshot does not exist', () => {
    expect(
      loadEnrichmentSnapshot('data/enrichment/does-not-exist.json'),
    ).toBeUndefined()
  })
})
