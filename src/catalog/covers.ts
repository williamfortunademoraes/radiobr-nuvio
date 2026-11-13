import type { GenreId } from '../stations/tags.js'
import type { RegionId } from './geography.js'

export function genreCover(id: GenreId): string {
  return `/assets/collections/genres/${id}.svg`
}

export function regionCover(id: RegionId): string {
  return `/assets/collections/regions/${id}.svg`
}

export function stateCover(code: string): string {
  return `/assets/collections/states/${code.toLowerCase()}.svg`
}
