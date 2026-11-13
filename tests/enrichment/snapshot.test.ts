import { describe, expect, it } from 'vitest'
import {
  mergeSnapshot,
  serializeSnapshot,
  type EnrichmentSnapshot,
} from '../../src/enrichment/snapshot.js'

const previous: EnrichmentSnapshot = {
  version: 1,
  generatedAt: '2026-11-12T00:00:00.000Z',
  records: [
    {
      stationUuid: 'b',
      data: { city: 'São Paulo', state: 'SP' },
      provenance: {},
      updatedAt: '2026-11-12T00:00:00.000Z',
    },
  ],
  failures: [],
}

describe('enrichment snapshot', () => {
  it('merges only verified incoming fields and preserves missing previous data', () => {
    const result = mergeSnapshot(previous, {
      version: 1,
      generatedAt: '2026-11-13T00:00:00.000Z',
      records: [
        {
          stationUuid: 'b',
          data: { state: 'RJ', slogan: 'A rádio do seu dia' },
          provenance: {},
          updatedAt: '2026-11-13T00:00:00.000Z',
        },
        {
          stationUuid: 'a',
          data: { name: 'Rádio Nova' },
          provenance: {},
          updatedAt: '2026-11-13T00:00:00.000Z',
        },
      ],
      failures: [{ source: 'radios-com-br', stationUuid: 'c', error: '404' }],
    })

    expect(result.records.map((record) => record.stationUuid)).toEqual([
      'a',
      'b',
    ])
    expect(result.records[1].data).toEqual({
      city: 'São Paulo',
      state: 'RJ',
      slogan: 'A rádio do seu dia',
    })
    expect(result.failures).toEqual([
      { source: 'radios-com-br', stationUuid: 'c', error: '404' },
    ])
  })

  it('serializes a deterministic readable JSON snapshot', () => {
    const result = serializeSnapshot(previous)
    expect(result).toBe(`${JSON.stringify(previous, null, 2)}\n`)
  })
})
