import { normalizeState, type StateCode } from '../stations/states.js'
import type { Station } from '../stations/types.js'

export interface StationIdentity {
  brand: string
  frequencies: string[]
  city?: string
  state?: StateCode
}

const frequencyPattern = /\b\d{2,3}(?:[.,]\d+)?\s*(?:mhz|am|fm)?\b/gi
const combiningMarks = /\p{M}/gu
const removableCityNames =
  /\b(?:sao paulo|rio de janeiro|belo horizonte|porto alegre|florianopolis|brasilia|recife|fortaleza)\b/gi

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(combiningMarks, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function frequenciesFromName(name: string): string[] {
  return [...name.matchAll(frequencyPattern)]
    .map((match) =>
      match[0].replace(/\s*(?:mhz|am|fm)\s*$/i, '').replace(',', '.'),
    )
    .map((frequency) => Number(frequency).toFixed(1))
    .filter((frequency, index, values) => values.indexOf(frequency) === index)
}

export function stationIdentityFromName(
  name: string,
): Pick<StationIdentity, 'brand' | 'frequencies'> {
  const frequencies = frequenciesFromName(name)
  const brand = normalizeText(name.replace(frequencyPattern, ' '))
    .replace(/\b(?:radio|rádio|fm|am|mhz|aac|mp3)\b/gi, ' ')
    .replace(removableCityNames, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
  return { brand, frequencies }
}

export function stationIdentity(
  station: Pick<Station, 'name' | 'city' | 'state'>,
): StationIdentity {
  const fromName = stationIdentityFromName(station.name)
  return {
    ...fromName,
    city: station.city ? normalizeText(station.city) : undefined,
    state: normalizeState(station.state),
  }
}

function compatibleLocation(
  left: StationIdentity,
  right: StationIdentity,
): boolean {
  if (left.state && right.state && left.state !== right.state) return false
  if (left.city && right.city && left.city !== right.city) return false
  return true
}

export function sameStationIdentity(
  left: Pick<Station, 'name' | 'city' | 'state'>,
  right: Pick<Station, 'name' | 'city' | 'state'>,
): boolean {
  const leftIdentity = stationIdentity(left)
  const rightIdentity = stationIdentity(right)
  if (leftIdentity.brand !== rightIdentity.brand) return false
  if (!compatibleLocation(leftIdentity, rightIdentity)) return false
  if (
    leftIdentity.frequencies.length > 0 &&
    rightIdentity.frequencies.length > 0 &&
    !leftIdentity.frequencies.some((frequency) =>
      rightIdentity.frequencies.includes(frequency),
    )
  )
    return false
  return true
}
