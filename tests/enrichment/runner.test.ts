import { describe, expect, it } from 'vitest'
import { runEnrichment } from '../../src/enrichment/runner.js'
import type { EnrichmentSnapshot } from '../../src/enrichment/snapshot.js'
import type { Station } from '../../src/stations/types.js'

const station = (uuid: string): Station => ({
  id: `radio-br:${uuid}`,
  stationUuid: uuid,
  name: `Rádio ${uuid}`,
  countryCode: 'BR',
  city: 'São Paulo',
  state: 'SP',
  tags: ['pop'],
  url: `https://radio.example/${uuid}`,
  hls: false,
})

describe('enrichment runner', () => {
  it('continues after one station source fails and keeps deterministic records', async () => {
    const result = await runEnrichment({
      stations: [station('b'), station('a')],
      now: '2026-11-12T00:00:00.000Z',
      lookup: async (current) => {
        if (current.stationUuid === 'b') throw new Error('source unavailable')
        return [
          {
            source: 'official-website',
            data: { slogan: 'A rádio atual' },
            provenance: {},
            checkedAt: '2026-11-12T00:00:00.000Z',
          },
        ]
      },
    })

    expect(result.snapshot.records.map((record) => record.stationUuid)).toEqual(
      ['a', 'b'],
    )
    expect(result.snapshot.records[0].data.slogan).toBe('A rádio atual')
    expect(result.snapshot.failures).toEqual([
      {
        source: 'official-website',
        stationUuid: 'b',
        error: 'source unavailable',
      },
    ])
  })

  it('limits concurrent station processing', async () => {
    let active = 0
    let maximum = 0
    const result = await runEnrichment({
      stations: [station('a'), station('b'), station('c')],
      concurrency: 2,
      lookup: async () => {
        active += 1
        maximum = Math.max(maximum, active)
        await new Promise((resolve) => setTimeout(resolve, 5))
        active -= 1
        return []
      },
    })

    expect(maximum).toBeLessThanOrEqual(2)
    expect(result.processed).toBe(3)
  })

  it('keeps source-level failures returned by a station lookup', async () => {
    const result = await runEnrichment({
      stations: [station('a')],
      lookup: async () => ({
        candidates: [],
        failures: [
          { source: 'radios-com-br', stationUuid: 'a', error: 'HTTP 403' },
        ],
      }),
    })

    expect(result.snapshot.failures).toEqual([
      { source: 'radios-com-br', stationUuid: 'a', error: 'HTTP 403' },
    ])
  })

  it('preserves a previous verified field when a later run has no replacement', async () => {
    const previous: EnrichmentSnapshot = {
      version: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      records: [
        {
          stationUuid: 'a',
          data: { slogan: 'Slogan preservado' },
          provenance: {},
          updatedAt: '2026-11-11T00:00:00.000Z',
        },
      ],
      failures: [],
    }
    const result = await runEnrichment({
      stations: [station('a')],
      previous,
      lookup: async () => [],
    })

    expect(result.snapshot.records[0].data.slogan).toBe('Slogan preservado')
  })
})
