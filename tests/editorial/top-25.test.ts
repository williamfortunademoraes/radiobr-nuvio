import { describe, expect, it } from 'vitest'
import { top25Ranking } from '../../src/editorial/top-25-ranking.js'
import { matchTop25Editorial } from '../../src/editorial/top-25-match.js'
import type { Station } from '../../src/stations/types.js'

function station(name: string, state: string, id = name): Station {
  return {
    id: `radio-br:${id}`,
    stationUuid: id,
    name,
    countryCode: 'BR',
    state,
    tags: [],
    url: `https://stream.example/${id}`,
    hls: false,
  }
}

describe('Radios.com.br Top 25', () => {
  it('preserves the exact 25 positions and source order', () => {
    expect(top25Ranking).toHaveLength(25)
    expect(top25Ranking.map((item) => item.position)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 1),
    )
    expect(top25Ranking[0]).toMatchObject({
      name: 'Rádio Gaúcha 93.7 FM',
      location: 'Porto Alegre / RS',
      sourcePeriod: '2026-07',
    })
    expect(top25Ranking[24]).toMatchObject({
      name: 'Rádio Liberdade 92.9 FM',
      location: 'Belo Horizonte / MG',
    })
  })

  it('matches explicit aliases and normalized name plus UF', () => {
    const result = matchTop25Editorial(top25Ranking.slice(0, 3), [
      station('Rádio Gaúcha', 'RS', 'gaucha'),
      station('Rádio Bandeirantes', 'SP', 'bandeirantes'),
      station('Super Rádio Tupi', 'RJ', 'tupi'),
    ])
    expect(result.map((item) => item.station?.id)).toEqual([
      'radio-br:gaucha',
      'radio-br:bandeirantes',
      'radio-br:tupi',
    ])
    expect(result.every((item) => item.matchStatus === 'matched')).toBe(true)
  })

  it('keeps unmatched ranking positions without substituting another station', () => {
    const result = matchTop25Editorial(top25Ranking.slice(0, 2), [
      station('Rádio Gaúcha', 'RS', 'gaucha'),
    ])
    expect(result).toHaveLength(2)
    expect(result[0].station?.id).toBe('radio-br:gaucha')
    expect(result[1]).toMatchObject({ matchStatus: 'unmatched' })
    expect(result[1].station).toBeUndefined()
  })
})
