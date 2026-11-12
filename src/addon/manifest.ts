export const manifest = {
  id: 'com.williamfortuna.radio-br',
  version: '0.1.0',
  name: 'Estações de rádios - Brasil',
  description:
    'RADIO BR reúne estações brasileiras com pesquisa, rádios em destaque e informações das emissoras para descobrir e reproduzir streams diretos no Nuvio.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['tv'],
  catalogs: [
    {
      type: 'tv',
      id: 'radio-br-featured',
      name: 'Rádios em destaque',
      extra: [{ name: 'search', isRequired: false }],
    },
    {
      type: 'tv',
      id: 'radio-br-catalog',
      name: 'Rádios do Brasil',
      extra: [{ name: 'search', isRequired: false }],
    },
  ],
} as const

export function createManifest(baseUrl: string) {
  const base = new URL(baseUrl)
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error('ADDON_BASE_URL must be an HTTP(S) URL without credentials')
  return {
    ...manifest,
    logo: new URL('/assets/logo.png', base).href,
    background: new URL('/assets/background.png', base).href,
  }
}
