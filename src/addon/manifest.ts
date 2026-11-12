export const manifest = {
  id: 'com.williamfortuna.radio-br',
  version: '0.1.0',
  name: 'RADIO BR',
  description: 'Estações de rádio brasileiras para Nuvio e Stremio.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['tv'],
  catalogs: [
    {
      type: 'tv',
      id: 'radio-br-catalog',
      name: 'Rádios do Brasil',
      extra: [{ name: 'search', isRequired: false }],
    },
  ],
} as const
