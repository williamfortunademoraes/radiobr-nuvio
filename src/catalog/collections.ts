import {
  BRAZILIAN_REGIONS,
  BRAZILIAN_STATES,
  type RegionId,
  type StateId,
} from '../stations/locations.js'
import { genreDefinitions, type GenreId } from '../stations/tags.js'

export type CollectionKind = 'genre' | 'region' | 'state'
export interface CollectionPreview {
  id: string
  type: 'tv'
  name: string
  poster: string
  posterShape: 'square'
  description?: string
}

export const collectionPoster = (kind: CollectionKind, id: string) =>
  `/assets/collections/${kind}.svg?collection=${encodeURIComponent(id)}`
export const genreCatalogId = (id: GenreId) => `radio-br-genre-${id}`
export const regionCatalogId = (id: RegionId) => `radio-br-region-${id}`
export const stateCatalogId = (id: StateId) => `radio-br-state-${id}`

export function genreCollections(): CollectionPreview[] {
  return genreDefinitions.slice(0, 18).map(({ id, name }) => ({
    id: genreCatalogId(id),
    type: 'tv',
    name,
    poster: collectionPoster('genre', id),
    posterShape: 'square',
  }))
}
export function regionCollections(): CollectionPreview[] {
  return BRAZILIAN_REGIONS.map(({ id, name }) => ({
    id: regionCatalogId(id),
    type: 'tv',
    name,
    poster: collectionPoster('region', id),
    posterShape: 'square',
  }))
}
export function stateCollections(region: RegionId): CollectionPreview[] {
  return BRAZILIAN_STATES.filter((state) => state.region === region).map(
    ({ id, name }) => ({
      id: stateCatalogId(id),
      type: 'tv',
      name: `${name} (${id})`,
      poster: collectionPoster('state', id),
      posterShape: 'square',
    }),
  )
}
