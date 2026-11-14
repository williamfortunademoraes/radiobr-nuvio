import { describe, expect, it } from 'vitest'
import { top25Enrichment } from '../../src/editorial/top-25-enrichment.js'
import { top25Ranking } from '../../src/editorial/top-25-ranking.js'

describe('top 25 editorial enrichment', () => {
  it('contains one complete editorial record for every ranking position', () => {
    expect(Object.keys(top25Enrichment).map(Number)).toEqual(
      top25Ranking.map((entry) => entry.position),
    )

    for (const entry of Object.values(top25Enrichment)) {
      expect(entry.slogan.trim()).not.toBe('')
      expect(entry.website).toMatch(/^https:\/\//)
      expect(entry.radiosComBrUrl).toMatch(/^https:\/\//)
      expect(entry.about.trim()).not.toBe('')
      expect(entry.sources.website).toMatch(/^https:\/\//)
    }
  })

  it('keeps position-specific brands aligned with the ranking', () => {
    expect(top25Enrichment[8].website).toBe('https://www.radiogrenal.com.br/')
    expect(top25Enrichment[15].website).toBe('https://metropolitana.com.br/')
    expect(top25Enrichment[25].website).toBe(
      'https://www.radioliberdade.com.br/',
    )
  })
})
