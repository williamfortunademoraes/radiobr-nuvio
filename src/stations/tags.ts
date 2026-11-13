export const genreDefinitions = [
  {
    id: 'noticias-esportes',
    name: 'Notícias e esportes',
    aliases: [
      'news',
      'noticia',
      'noticias',
      'jornalismo',
      'jornalistico',
      'journalism',
      'talk',
      'talk radio',
      'spoken',
      'spoken word',
      'sport',
      'sports',
      'esporte',
      'esportes',
      'futebol',
      'football',
    ],
  },
  {
    id: 'musica',
    name: 'Música',
    aliases: [
      'music',
      'musica',
      'musical',
      'musica variada',
      'variedades musicais',
    ],
  },
  {
    id: 'sertanejo',
    name: 'Sertanejo',
    aliases: [
      'sertanejo',
      'sertaneja',
      'sertanejo universitario',
      'sertanejo raiz',
      'modao',
      'moda de viola',
    ],
  },
  {
    id: 'samba-pagode',
    name: 'Samba e pagode',
    aliases: [
      'pagode',
      'pagode brasileiro',
      'samba',
      'samba brasileiro',
      'samba de raiz',
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    aliases: [
      'rock',
      'classic rock',
      'rock nacional',
      'hard rock',
      'rock alternativo',
      'alternative',
      'alternativo',
      'indie rock',
      'punk',
      'punk rock',
    ],
  },
  {
    id: 'gospel',
    name: 'Gospel',
    aliases: [
      'gospel',
      'musica gospel',
      'christian',
      'cristao',
      'crista',
      'religious',
      'religioso',
      'religiosa',
    ],
  },
  {
    id: 'pop',
    name: 'Pop',
    aliases: ['pop', 'pop music', 'top 40', 'hits'],
  },
  {
    id: 'mpb',
    name: 'MPB',
    aliases: ['mpb', 'musica popular brasileira'],
  },
  {
    id: 'eletronica',
    name: 'Música eletrônica',
    aliases: [
      'eletronica',
      'electronic',
      'electronic music',
      'electronica',
      'dance',
      'dance music',
      'edm',
      'house',
      'techno',
      'trance',
    ],
  },
  { id: 'outros', name: 'Outros gêneros', aliases: [] },
] as const

export type GenreId = (typeof genreDefinitions)[number]['id']
export type GenreDefinition = (typeof genreDefinitions)[number]

export const GENRE_IDS = genreDefinitions.map((genre) => genre.id) as GenreId[]
export const GENRE_NAMES = genreDefinitions.map((genre) => genre.name)

const COMBINING_MARKS = /\p{M}/gu

export function normalizeTag(tag: string): string {
  return tag
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function normalizeTags(tags: string | readonly string[]): string[] {
  const list =
    typeof tags === 'string'
      ? tags.split(',')
      : tags.flatMap((tag) => tag.split(','))
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const tag of list) {
    const value = normalizeTag(tag)
    if (!value || seen.has(value)) continue
    seen.add(value)
    normalized.push(value)
  }
  return normalized
}

const aliasToGenres = new Map<string, GenreId[]>()
const genreLookup = new Map<string, GenreId>()

for (const genre of genreDefinitions) {
  genreLookup.set(normalizeTag(genre.name), genre.id)
  genreLookup.set(normalizeTag(genre.id), genre.id)
  for (const alias of genre.aliases) {
    const value = normalizeTag(alias)
    const genres = aliasToGenres.get(value) ?? []
    if (!genres.includes(genre.id)) genres.push(genre.id)
    aliasToGenres.set(value, genres)
  }
}

const genericTags = new Set([
  'am',
  'ao vivo',
  'brasil',
  'brazil',
  'brazilian',
  'br',
  'estacao',
  'estacao de radio',
  'fm',
  'live',
  'online',
  'radio',
  'radio fm',
  'radios',
  'station',
  'stations',
  'tv',
  'web radio',
  'webradio',
])

export interface TagClassification {
  genres: GenreId[]
  hasIdentifiableTag: boolean
}

export function classifyStationTags(
  tags: string | readonly string[],
): TagClassification {
  const normalized = normalizeTags(tags)
  const found = new Set<GenreId>()
  for (const tag of normalized) {
    for (const genre of aliasToGenres.get(tag) ?? []) found.add(genre)
  }
  return {
    genres: GENRE_IDS.filter((genre) => found.has(genre)),
    hasIdentifiableTag: normalized.some((tag) => !genericTags.has(tag)),
  }
}

export function classifyTags(tags: string | readonly string[]): GenreId[] {
  return classifyStationTags(tags).genres
}

export function resolveGenre(value: string): GenreId | undefined {
  return genreLookup.get(normalizeTag(value))
}

export function genreName(id: GenreId): string {
  return genreDefinitions.find((genre) => genre.id === id)!.name
}
