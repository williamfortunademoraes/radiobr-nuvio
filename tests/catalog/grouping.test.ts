import { describe, expect, it } from 'vitest'
import {
  groupStationsByGenre,
  type GenreGroups,
} from '../../src/catalog/grouping.js'
import type { GenreId } from '../../src/stations/tags.js'
import type { Station } from '../../src/stations/types.js'

function station(
  uuid: string,
  tags: string[],
  overrides: Partial<Station> = {},
): Station {
  return {
    id: `radio-br:${uuid}`,
    stationUuid: uuid,
    name: `Rádio ${uuid}`,
    countryCode: 'BR',
    tags,
    hls: false,
    ...overrides,
  }
}

function onlyGroup(groups: GenreGroups, genre: GenreId): Station[] {
  return groups[genre]
}

describe('grouping by genre', () => {
  it.each([
    ['news', 'noticias-esportes'],
    ['esportes', 'noticias-esportes'],
    ['music', 'musica'],
    ['sertanejo', 'sertanejo'],
    ['pagode', 'samba-pagode'],
    ['samba', 'samba-pagode'],
    ['rock', 'rock'],
    ['gospel', 'gospel'],
    ['pop', 'pop'],
    ['mpb', 'mpb'],
    ['eletronica', 'eletronica'],
    ['forró', 'outros'],
    ['radio, live', 'outros'],
    ['', 'outros'],
  ] as const)('places a station tagged %j in %s', (tag, genre) => {
    const item = station('11111111-1111-4111-8111-111111111111', [tag])
    const groups = groupStationsByGenre([item])
    expect(onlyGroup(groups, genre)).toEqual([item])
    const otherGenres = Object.keys(groups).filter((key) => key !== genre)
    for (const key of otherGenres) expect(groups[key as GenreId]).toEqual([])
  })

  it('keeps a station in every explicitly tagged genre', () => {
    const item = station('22222222-2222-4222-8222-222222222222', [
      'sertanejo',
      'pop',
    ])
    const groups = groupStationsByGenre([item])
    expect(groups.sertanejo).toEqual([item])
    expect(groups.pop).toEqual([item])
    expect(groups.rock).toEqual([])
  })

  it('adds broad and specific genres only when both tags exist', () => {
    const broad = station('33333333-3333-4333-8333-333333333333', ['music'])
    const specific = station('44444444-4444-4444-8444-444444444444', [
      'sertanejo',
    ])
    const groups = groupStationsByGenre([broad, specific])
    expect(groups.musica).toEqual([broad])
    expect(groups.sertanejo).toEqual([specific])
  })

  it('preserves the original station order inside each group', () => {
    const first = station('55555555-5555-4555-8555-555555555555', ['rock'])
    const second = station('66666666-6666-4666-8666-666666666666', ['rock'])
    expect(groupStationsByGenre([first, second]).rock).toEqual([first, second])
    expect(groupStationsByGenre([second, first]).rock).toEqual([second, first])
  })

  it('never infers genre from name, domain, homepage or location', () => {
    const item = station('77777777-7777-4777-8777-777777777777', [], {
      name: 'Rock FM Sertanejo',
      homepage: 'https://rock.example/sertanejo',
      url: 'https://gospel.example/live.mp3',
      state: 'SP',
      language: 'portuguese',
    })
    const groups = groupStationsByGenre([item])
    expect(groups.outros).toEqual([item])
    expect(groups.rock).toEqual([])
    expect(groups.sertanejo).toEqual([])
    expect(groups.gospel).toEqual([])
  })

  it('preserves the original station objects and their tags', () => {
    const item = station('88888888-8888-4888-8888-888888888888', [
      'Sertanejo',
      'Música Gospel',
    ])
    const [grouped] = groupStationsByGenre([item]).sertanejo
    expect(grouped).toBe(item)
    expect(grouped.tags).toEqual(['Sertanejo', 'Música Gospel'])
  })

  it('reuses the grouping result for the same station collection', () => {
    const stations = [
      station('99999999-9999-4999-8999-999999999999', ['samba']),
    ]
    expect(groupStationsByGenre(stations)).toBe(groupStationsByGenre(stations))
    const copy = [...stations]
    expect(groupStationsByGenre(copy)).toBe(groupStationsByGenre(copy))
    expect(groupStationsByGenre(copy)).not.toBe(groupStationsByGenre(stations))
  })
})
