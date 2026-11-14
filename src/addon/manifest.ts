import {
  buildCatalogs,
  defaultConfig,
  type AddonConfig,
} from '../config/addon-config.js'

/**
 * The `config` array is required by the official SDK to enable the
 * `/:config?/manifest.json` routes. The real configuration experience is the
 * RADIO BR wizard at `/personalizar` (also served at `/configure`), so this
 * entry is only a compatibility hook for clients that inspect manifest.config.
 */
export const manifest = {
  id: 'com.williamfortuna.radio-br',
  version: '0.1.4',
  name: 'Estações de rádios - Brasil',
  description:
    'RADIO BR reúne estações brasileiras com pesquisa, rádios em destaque, navegação por gênero e informações das emissoras para descobrir e reproduzir streams diretos no Nuvio.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['tv'],
  catalogs: buildCatalogs(defaultConfig()),
  config: [
    {
      key: 'perfil',
      type: 'select',
      title: 'Perfil de catálogos',
      options: ['Completo'],
      default: 'Completo',
    },
  ],
  behaviorHints: {
    configurable: true,
  },
} as const

function validateBaseUrl(baseUrl: string): URL {
  const base = new URL(baseUrl)
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error('ADDON_BASE_URL must be an HTTP(S) URL without credentials')
  return base
}

export function createManifest(baseUrl: string, config?: AddonConfig) {
  const base = validateBaseUrl(baseUrl)
  const configured = config !== undefined

  return {
    id: manifest.id,
    version: manifest.version,
    name: manifest.name,
    description: manifest.description,
    resources: manifest.resources,
    types: manifest.types,
    catalogs: configured ? buildCatalogs(config) : manifest.catalogs,
    ...(configured
      ? {}
      : {
          config: manifest.config,
          behaviorHints: manifest.behaviorHints,
        }),
    logo: new URL('/assets/logo.png', base).href,
    background: new URL('/assets/background.png', base).href,
  }
}
