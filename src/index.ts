import { createRequire } from 'node:module'
import { createAddon } from './addon/create-addon.js'
import { loadConfig } from './config/index.js'

const require = createRequire(import.meta.url)
const { serveHTTP } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')
serveHTTP(createAddon(), { port: loadConfig().port })
