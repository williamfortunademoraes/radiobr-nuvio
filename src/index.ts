import { createRequire } from 'node:module'
import { createAddon } from './addon/create-addon.js'
import { loadConfig } from './config/index.js'

const require = createRequire(import.meta.url)
const { serveHTTP } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')
const { port } = loadConfig()
const baseUrl = process.env.ADDON_BASE_URL ?? `http://127.0.0.1:${port}`
await serveHTTP(createAddon(undefined, baseUrl), { port, static: '/assets' })
