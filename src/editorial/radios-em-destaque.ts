import { top25Ranking } from './top-25-ranking.js'
import type { EditorialCollection } from './types.js'

function locationParts(location: string): { city?: string; state?: string } {
  const [city, state] = location.split('/').map((part) => part.trim())
  return { city, state }
}

export const radiosEmDestaque: EditorialCollection = {
  id: 'radios-em-destaque',
  name: 'Destaques',
  type: 'editorial',
  scope: 'national-and-regional',
  ordering: 'manual',
  enabled: true,
  showOnHome: true,
  items: top25Ranking.map((ranking) => ({
    id: `top25-${ranking.position}`,
    name: ranking.name,
    category: 'Destaques',
    ...locationParts(ranking.location),
    sourceUrl: ranking.sourceUrl,
    websiteUrl: ranking.radiosComBrUrl,
  })),
}

export function findEditorialRadioById(id: string) {
  return radiosEmDestaque.items.find((item) => item.id === id)
}
