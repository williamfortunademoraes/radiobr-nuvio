import type { Station } from '../stations/types.js'

function usable(value?: string): boolean {
  try {
    const url = new URL(value ?? '')
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}
function completeness(s: Station): number {
  return [
    s.favicon,
    s.homepage,
    s.state,
    s.language,
    s.tags.length,
    s.codec,
    s.bitrate,
  ].filter(Boolean).length
}
function clicks(s: Station): number {
  return Number.isFinite(s.clickcount) ? Math.max(0, s.clickcount!) : 0
}
export function rankFeaturedStations(stations: Station[]): Station[] {
  const sorted = stations
    .filter(
      (s) =>
        s.countryCode === 'BR' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          s.stationUuid,
        ) &&
        Boolean(s.sourceName?.trim()) &&
        s.lastcheckok !== 0 &&
        s.lastcheckok !== '0' &&
        (usable(s.urlResolved) || usable(s.url)),
    )
    .sort(
      (a, b) =>
        clicks(b) - clicks(a) ||
        Number(Number(b.lastcheckok) === 1) -
          Number(Number(a.lastcheckok) === 1) ||
        completeness(b) - completeness(a) ||
        Number(usable(b.urlResolved)) - Number(usable(a.urlResolved)) ||
        (a.stationUuid.toLowerCase() < b.stationUuid.toLowerCase()
          ? -1
          : a.stationUuid.toLowerCase() > b.stationUuid.toLowerCase()
            ? 1
            : JSON.stringify(a).localeCompare(JSON.stringify(b))),
    )
  const seen = new Set<string>()
  return sorted.filter((s) => {
    const id = s.stationUuid.toLowerCase()
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}
