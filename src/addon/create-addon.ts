import { createRequire } from 'node:module'
import { manifest, createManifest } from './manifest.js'
import { createCatalogService } from '../catalog/catalog.js'
import { createMetadataService } from '../metadata/metadata.js'
import { createStreamService } from '../streams/streams.js'
import { RadioBrowserClient } from '../radio-browser/client.js'
import { loadEnrichmentSnapshot } from '../enrichment/storage.js'

const require = createRequire(import.meta.url)
const { addonBuilder: AddonBuilder } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')

export function createAddon(
  client = new RadioBrowserClient(),
  baseUrl?: string,
) {
  const fallbackPoster = baseUrl
    ? new URL('/assets/logo.png', baseUrl).href
    : undefined
  const snapshot = loadEnrichmentSnapshot()
  const catalog = createCatalogService(client, fallbackPoster, snapshot)
  const metadata = createMetadataService(client, snapshot)
  const streams = createStreamService(client)
  const builder = new AddonBuilder(baseUrl ? createManifest(baseUrl) : manifest)
  builder.defineCatalogHandler((args: any) => catalog.getCatalog(args))
  builder.defineMetaHandler((args: any) => metadata.getMetadata(args))
  builder.defineStreamHandler((args: any) => streams.getStreams(args))
  return builder.getInterface()
}
