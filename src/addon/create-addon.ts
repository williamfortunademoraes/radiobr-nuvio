import { createRequire } from 'node:module'
import { manifest } from './manifest.js'
import { createCatalogService } from '../catalog/catalog.js'
import { createMetadataService } from '../metadata/metadata.js'
import { createStreamService } from '../streams/streams.js'
import { RadioBrowserClient } from '../radio-browser/client.js'

const require = createRequire(import.meta.url)
const { addonBuilder: AddonBuilder } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')

export function createAddon(client = new RadioBrowserClient()) {
  const catalog = createCatalogService(client)
  const metadata = createMetadataService(client)
  const streams = createStreamService(client)
  const builder = new AddonBuilder(manifest)
  builder.defineCatalogHandler((args: any) => catalog.getCatalog(args))
  builder.defineMetaHandler((args: any) => metadata.getMetadata(args))
  builder.defineStreamHandler((args: any) => streams.getStreams(args))
  return builder.getInterface()
}
