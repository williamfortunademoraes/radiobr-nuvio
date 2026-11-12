import {
  GENRE_IDS,
  genreDefinitions,
  genreName,
  type GenreId,
} from '../stations/tags.js'
import {
  STATE_CODES,
  normalizeState,
  type StateCode,
} from '../stations/states.js'

export const CONFIG_VERSION = 1
export const MAX_CONFIG_LENGTH = 2048

export interface CollectionDefinition {
  id: 'editorial' | 'featured' | 'all' | 'news' | 'sports' | 'unknown'
  name: string
  short: string
  description: string
  catalogId: string
  icon: string
}

export const COLLECTION_DEFINITIONS = [
  {
    id: 'editorial',
    name: 'Rádios em Destaque — curadoria',
    short: 'Curadoria',
    description:
      'Treze emissoras escolhidas manualmente pela curadoria editorial do RADIO BR.',
    catalogId: 'radios-em-destaque',
    icon: 'star',
  },
  {
    id: 'featured',
    name: 'Rádios em destaque — ranking',
    short: 'Ranking',
    description:
      'Uma seleção automática das estações mais populares, completas e disponíveis do Brasil.',
    catalogId: 'radio-br-featured',
    icon: 'star',
  },
  {
    id: 'all',
    name: 'Todas as rádios brasileiras',
    short: 'Todas',
    description:
      'O catálogo completo com as estações brasileiras disponíveis na Radio Browser.',
    catalogId: 'radio-br-catalog',
    icon: 'globe',
  },
  {
    id: 'news',
    name: 'Notícias',
    short: 'Notícias',
    description: 'Jornalismo, talk radio e cobertura de notícias.',
    catalogId: 'radio-br-news',
    icon: 'news',
  },
  {
    id: 'sports',
    name: 'Esportes',
    short: 'Esportes',
    description: 'Futebol, debates esportivos e transmissões ao vivo.',
    catalogId: 'radio-br-sports',
    icon: 'sports',
  },
  {
    id: 'unknown',
    name: 'Rádios sem gênero identificado',
    short: 'Sem gênero',
    description:
      'Estações que ainda não informaram uma categoria reconhecível nas tags.',
    catalogId: 'radio-br-nogenero',
    icon: 'question',
  },
] as const satisfies readonly CollectionDefinition[]

export type CollectionId = (typeof COLLECTION_DEFINITIONS)[number]['id']
export const COLLECTION_IDS = COLLECTION_DEFINITIONS.map(
  (collection) => collection.id,
) as CollectionId[]

export const MUSIC_GENRE_IDS = [
  'sertanejo',
  'pagode',
  'samba',
  'rock',
  'gospel',
  'pop',
  'mpb',
  'eletronica',
  'outros',
] as const satisfies readonly GenreId[]

export type MusicGenreId = (typeof MUSIC_GENRE_IDS)[number]

export interface AddonConfig {
  v: number
  c: CollectionId[]
  g: GenreId[]
  s: StateCode[]
  o: { logos: boolean }
}

export interface ManifestCatalogExtra {
  name: string
  isRequired?: boolean
  options?: string[]
}

export interface ManifestCatalog {
  type: 'tv'
  id: string
  name: string
  extra?: ManifestCatalogExtra[]
}

export interface ConfigValidationSuccess {
  ok: true
  config: AddonConfig
}

export interface ConfigValidationFailure {
  ok: false
  error: string
}

export type ConfigValidation = ConfigValidationSuccess | ConfigValidationFailure

export function defaultConfig(): AddonConfig {
  return {
    v: CONFIG_VERSION,
    c: ['editorial', 'featured', 'all'],
    g: [...GENRE_IDS],
    s: [],
    o: { logos: true },
  }
}

const collectionSet = new Set<string>(COLLECTION_IDS)
const genreSet = new Set<string>(GENRE_IDS)

function failure(error: string): ConfigValidationFailure {
  return { ok: false, error }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readEnumList(
  value: unknown,
  allowed: Set<string>,
  max: number,
): string[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > max) return null
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') return null
    const normalized = item.trim()
    if (!allowed.has(normalized)) return null
    if (seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result
}

function readStateList(value: unknown): StateCode[] | null {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > STATE_CODES.length) return null
  const found = new Set<StateCode>()
  for (const item of value) {
    if (typeof item !== 'string') return null
    const code = normalizeState(item)
    if (!code) return null
    found.add(code)
  }
  return STATE_CODES.filter((code) => found.has(code))
}

/**
 * Validates and canonicalizes a configuration object.
 *
 * Unknown keys are rejected. Arrays are de-duplicated and restored
 * to the product's canonical order, which keeps the same choices reproducible.
 */
export function validateConfig(value: unknown): ConfigValidation {
  if (!isRecord(value))
    return failure('A configuração deve ser um objeto JSON.')

  let serializedLength = 0
  try {
    serializedLength = JSON.stringify(value).length
  } catch {
    return failure('A configuração não pôde ser lida.')
  }
  if (serializedLength > MAX_CONFIG_LENGTH)
    return failure('A configuração excede o limite de tamanho.')

  const keys = Object.keys(value)
  const knownKeys = new Set(['v', 'c', 'g', 's', 'o'])
  const hasKnownKey = keys.some((key) => knownKeys.has(key))

  if (!hasKnownKey) {
    // The SDK's built-in form produces `{ perfil: "..." }`. The real wizard is
    // our page, but accepting this shape as the default keeps the addon usable
    // with clients that render manifest.config themselves.
    if (
      keys.length === 1 &&
      keys[0] === 'perfil' &&
      value.perfil === 'Completo'
    )
      return { ok: true, config: defaultConfig() }
    return failure('A configuração não contém opções reconhecidas.')
  }

  if (value.v !== undefined && value.v !== CONFIG_VERSION)
    return failure('Versão de configuração não suportada.')

  if (keys.some((key) => !knownKeys.has(key)))
    return failure('A configuração contém opções desconhecidas.')

  const collections = readEnumList(
    value.c,
    collectionSet,
    COLLECTION_IDS.length,
  )
  if (!collections) return failure('Seleção de coleções inválida.')

  const genres = readEnumList(value.g, genreSet, GENRE_IDS.length)
  if (!genres) return failure('Seleção de gêneros inválida.')

  const states = readStateList(value.s)
  if (!states) return failure('Seleção de estados inválida.')

  let logos = true
  if (value.o !== undefined) {
    if (!isRecord(value.o)) return failure('Opções de experiência inválidas.')
    if (Object.keys(value.o).some((key) => key !== 'logos'))
      return failure('Opções de experiência desconhecidas.')
    if (value.o.logos !== undefined) {
      if (typeof value.o.logos !== 'boolean')
        return failure('Opção de logotipos inválida.')
      logos = value.o.logos
    }
  }

  if (collections.length === 0 && genres.length === 0)
    return failure('Selecione pelo menos uma coleção ou gênero.')

  const collectionSetResult = new Set(collections)
  const genreSetResult = new Set(genres)

  return {
    ok: true,
    config: {
      v: CONFIG_VERSION,
      c: COLLECTION_IDS.filter((id) => collectionSetResult.has(id)),
      g: GENRE_IDS.filter((id) => genreSetResult.has(id)),
      s: states,
      o: { logos },
    },
  }
}

/**
 * Resolves the `config` argument that the SDK passes to resource handlers.
 *
 * The SDK defaults to `{}` when the URL has no config segment, so an empty
 * object means "default addon". An explicit invalid object yields `null`.
 */
export function resolveHandlerConfig(value: unknown): AddonConfig | null {
  if (value === undefined || value === null) return defaultConfig()
  if (value === false) return null
  if (isRecord(value) && Object.keys(value).length === 0) return defaultConfig()
  const result = validateConfig(value)
  return result.ok ? result.config : null
}

/**
 * Parses the raw config segment used by the official SDK route
 * `/:config?/manifest.json`.
 */
export function parseConfigSegment(
  segment: string | undefined | null,
): ConfigValidation {
  if (!segment) return failure('Configuração ausente.')
  if (segment.length > MAX_CONFIG_LENGTH)
    return failure('A configuração excede o limite de tamanho.')

  let raw = segment
  try {
    raw = decodeURIComponent(segment)
  } catch {
    // Express already decodes params; keep the original value when it is not
    // percent-encoded.
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return failure('Configuração inválida.')
  }
  return validateConfig(parsed)
}

export function canonicalConfig(config: AddonConfig): AddonConfig {
  const collections = new Set(config.c)
  const genres = new Set(config.g)
  const states = new Set(config.s)
  return {
    v: CONFIG_VERSION,
    c: COLLECTION_IDS.filter((id) => collections.has(id)),
    g: GENRE_IDS.filter((id) => genres.has(id)),
    s: STATE_CODES.filter((code) => states.has(code)),
    o: { logos: config.o.logos !== false },
  }
}

/**
 * Serializes a config in the exact shape consumed by the SDK:
 * `encodeURIComponent(JSON.stringify(config))`.
 *
 * Defaults are omitted to keep the URL compact. The receiver still validates
 * every field, so a shortened config cannot introduce arbitrary values.
 */
export function encodeConfig(config: AddonConfig): string {
  const canonical = canonicalConfig(config)
  const payload: Record<string, unknown> = { v: CONFIG_VERSION }
  if (canonical.c.length) payload.c = canonical.c
  if (canonical.g.length) payload.g = canonical.g
  if (canonical.s.length) payload.s = canonical.s
  if (!canonical.o.logos) payload.o = { logos: false }
  return encodeURIComponent(JSON.stringify(payload))
}

const searchExtra: ManifestCatalogExtra = {
  name: 'search',
  isRequired: false,
}

/**
 * Builds the catalogs declared by a configuration. Catalog order is stable:
 * featured, news, sports, unknown, genre, all. With the default config this
 * preserves the historical featured/genre/all order.
 */
export function buildCatalogs(config: AddonConfig): ManifestCatalog[] {
  const catalogs: ManifestCatalog[] = []
  const collections = new Set(config.c)

  if (collections.has('editorial'))
    catalogs.push({
      type: 'tv',
      id: 'radios-em-destaque',
      name: 'Rádios em Destaque',
      extra: [searchExtra],
    })

  if (collections.has('featured'))
    catalogs.push({
      type: 'tv',
      id: 'radio-br-featured',
      name: 'Rádios em destaque',
      extra: [searchExtra],
    })

  if (collections.has('news'))
    catalogs.push({
      type: 'tv',
      id: 'radio-br-news',
      name: 'Notícias',
      extra: [searchExtra],
    })

  if (collections.has('sports'))
    catalogs.push({
      type: 'tv',
      id: 'radio-br-sports',
      name: 'Esportes',
      extra: [searchExtra],
    })

  if (collections.has('unknown'))
    catalogs.push({
      type: 'tv',
      id: 'radio-br-nogenero',
      name: 'Rádios sem gênero identificado',
      extra: [searchExtra],
    })

  if (config.g.length)
    catalogs.push({
      type: 'tv',
      id: 'radio-br-genre',
      name: 'Rádios por gênero',
      extra: [
        {
          name: 'genre',
          isRequired: false,
          options: config.g.map((genre) => genreName(genre)),
        },
        searchExtra,
      ],
    })

  if (config.g.length)
    catalogs.push(
      ...config.g.map((genre) => ({
        type: 'tv' as const,
        id: `radio-br-genre-${genre}`,
        name: genreName(genre),
        extra: [searchExtra],
      })),
    )

  if (STATE_CODES.length)
    catalogs.push(
      ...(config.s.length ? config.s : STATE_CODES).map((state) => ({
        type: 'tv' as const,
        id: `radio-br-region-${state.toLowerCase()}`,
        name: `Rádios por região — ${state}`,
        extra: [searchExtra],
      })),
    )

  if (collections.has('all'))
    catalogs.push({
      type: 'tv',
      id: 'radio-br-catalog',
      name: 'Rádios do Brasil',
      extra: [searchExtra],
    })

  return catalogs
}

export function catalogAllowed(id: string, config: AddonConfig): boolean {
  if (id.startsWith('radio-br-genre-'))
    return config.g.some((genre) => id === `radio-br-genre-${genre}`)
  if (id.startsWith('radio-br-region-'))
    return (config.s.length ? config.s : STATE_CODES).some(
      (state) => id === `radio-br-region-${state.toLowerCase()}`,
    )
  switch (id) {
    case 'radios-em-destaque':
      return config.c.includes('editorial')
    case 'radio-br-featured':
      return config.c.includes('featured')
    case 'radio-br-catalog':
      return config.c.includes('all')
    case 'radio-br-news':
      return config.c.includes('news')
    case 'radio-br-sports':
      return config.c.includes('sports')
    case 'radio-br-nogenero':
      return config.c.includes('unknown')
    case 'radio-br-genre':
      return config.g.length > 0
    default:
      return false
  }
}

export function collectionName(id: CollectionId): string {
  return COLLECTION_DEFINITIONS.find((collection) => collection.id === id)!.name
}

export function musicGenreDefinitions() {
  return MUSIC_GENRE_IDS.map((id) => {
    const definition = genreDefinitions.find((genre) => genre.id === id)!
    return { id, name: definition.name }
  })
}
