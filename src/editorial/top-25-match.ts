import { normalizeState } from '../stations/states.js'
import type { Station } from '../stations/types.js'
import type { Top25RankingEntry } from './top-25-ranking.js'
import { stationIdentityFromName } from '../catalog/identity.js'

export interface MatchedTop25Entry {
  ranking: Top25RankingEntry
  station?: Station
  matchStatus: 'matched' | 'unmatched'
}

const aliases: Record<string, string[]> = {
  radiogaucha937fm: ['radiogaucha'],
  radiobandeirantes1073fm: ['radiobandeirantes'],
  superradiotupi965fm: ['radiotupi', 'superradiotupi'],
  radioitatiaia610am957fm: ['radioitatiaia'],
  radiojovempannews: ['jovempannews', 'radiojovempannews'],
  radiocbnsaopaulo905fm: ['cbn', 'radiocbn'],
  radiobandnewssp969fm: ['bandnewsfm', 'radiobandnewssp'],
  radiogrenal959fm: ['grenal', 'radiogrenal'],
  radioantena1947fm: ['antena1', 'radioantena1'],
  radiosaudade997fm: ['radiosaudade'],
  radioband961fm: ['radioband'],
  radionativa953fm: ['radionativa'],
  radiojbfm999: ['jbfm', 'radiojbfm'],
  radioalpha1017fm: ['alpha', 'radioalpha'],
  radiometropolitana985fm: ['metropolitana', 'radiometropolitana'],
  radiotmc1001fm: ['tmc', 'radiotmc'],
  radio89fmradirock: ['89fm', 'radio89fm'],
  radiojornalderecife903fm: ['radiojornal', 'radiojornalderecife'],
  radiomelodia975fm: ['melodia', 'radiomelodia'],
  radioaparecida1043fm: ['aparecida', 'radioaparecida'],
  radiofmodia1005: ['fmodia', 'radiofmodia'],
  radioclube1055fm: ['radioclube', 'clube'],
  radiomix1063fm: ['radiomix', 'mix'],
  radiojangadeiro889fm: ['jangadeiro', 'radiojangadeiro'],
  radioliberdade929fm: ['radioliberdade', 'liberdade'],
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function rankingState(location: string) {
  return normalizeState(location.split('/').at(-1))
}

function matchesName(ranking: Top25RankingEntry, station: Station): boolean {
  const key = normalize(ranking.name)
  const candidate = normalize(station.name)
  const choices = [key, ...(aliases[key] ?? [])]
  return choices.some(
    (choice) => candidate === choice || candidate.startsWith(choice),
  )
}

function matchesFrequency(
  ranking: Top25RankingEntry,
  station: Station,
): boolean {
  const expected = stationIdentityFromName(ranking.name).frequencies
  const actual = stationIdentityFromName(station.name).frequencies
  return (
    expected.length === 0 ||
    actual.length === 0 ||
    expected.some((frequency) => actual.includes(frequency))
  )
}

/** Removes additional Radio Browser records representing a Top 25 station. */
export function removeTop25Duplicates(
  ranking: readonly Top25RankingEntry[],
  stations: readonly Station[],
): Station[] {
  const canonicalIds = new Set(
    matchTop25Editorial(ranking, stations)
      .map((item) => item.station?.id)
      .filter((id): id is string => Boolean(id)),
  )
  return stations.filter((station) => {
    if (canonicalIds.has(station.id)) return true
    return !ranking.some((entry) => {
      const state = rankingState(entry.location)
      return (
        matchesName(entry, station) &&
        matchesFrequency(entry, station) &&
        (!state || !station.state || normalizeState(station.state) === state)
      )
    })
  })
}

export function matchTop25Editorial(
  ranking: readonly Top25RankingEntry[],
  stations: readonly Station[],
): MatchedTop25Entry[] {
  const used = new Set<string>()
  return ranking.map((entry) => {
    const state = rankingState(entry.location)
    const station = stations.find((candidate) => {
      if (used.has(candidate.id) || !matchesName(entry, candidate)) return false
      return !state || normalizeState(candidate.state) === state
    })
    if (station) used.add(station.id)
    return {
      ranking: entry,
      station,
      matchStatus: station ? 'matched' : 'unmatched',
    }
  })
}
