import { stateName, normalizeState } from '../stations/states.js'
import type { EnrichedStationData } from './types.js'

function normalizedKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const categoryAliases: Record<string, string> = {
  'pop music': 'Pop',
  pop: 'Pop',
  sertaneja: 'Sertanejo',
  sertanejo: 'Sertanejo',
  rock: 'Rock',
  gospel: 'Gospel',
  jazz: 'Jazz',
  'adult contemporary': 'Adult Contemporary',
}

export function normalizeCategories(values: readonly string[]): string[] {
  const result: string[] = []
  const seen = new Set<string>()
  for (const value of values) {
    const text = value.trim()
    if (!text) continue
    const canonical = categoryAliases[normalizedKey(text)] ?? text
    const key = normalizedKey(canonical)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(canonical)
  }
  return result
}

export function normalizeEnrichedData(
  value: EnrichedStationData,
): EnrichedStationData {
  const state = normalizeState(value.state)
  return {
    ...(value.name?.trim() ? { name: value.name.trim() } : {}),
    ...(value.city?.trim()
      ? { city: value.city.trim().replace(/\s+/g, ' ') }
      : {}),
    ...(state ? { state, stateName: stateName(state) } : {}),
    ...(value.categories
      ? { categories: normalizeCategories(value.categories) }
      : {}),
    ...(value.slogan?.trim() ? { slogan: value.slogan.trim() } : {}),
    ...(value.about?.trim() ? { about: value.about.trim() } : {}),
    ...(value.logo?.trim() ? { logo: value.logo.trim() } : {}),
  }
}
