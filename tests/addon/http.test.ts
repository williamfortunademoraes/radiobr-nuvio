import { createRequire } from 'node:module'
import { expect, it, vi } from 'vitest'
import { createAddon } from '../../src/addon/create-addon.js'
import { createManifest } from '../../src/addon/manifest.js'
import { RadioBrowserClient } from '../../src/radio-browser/client.js'
import { validStation } from '../fixtures/station.js'

const require = createRequire(import.meta.url)
const { serveHTTP } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')

it('serves both catalogs, genre filters, streams and PNG assets through the SDK with shared cache', async () => {
  const sertanejoUuid = '22222222-2222-4222-8222-222222222222'
  const fetcher = vi.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(
        JSON.stringify([
          validStation,
          {
            ...validStation,
            stationuuid: sertanejoUuid,
            name: 'Rádio Sertanejo',
            tags: 'sertanejo, brazil',
            clickcount: 50,
          },
        ]),
      ),
    ),
  )
  const client = new RadioBrowserClient(undefined, fetcher)
  const { url, server } = await serveHTTP(
    createAddon(client, 'http://127.0.0.1:7002'),
    { port: 0, static: '/assets' },
  )
  const base = new URL(url).origin
  try {
    const manifestResponse = await fetch(url)
    expect(manifestResponse.status).toBe(200)
    const manifest = await manifestResponse.json()
    expect(manifest.catalogs.map((c: { id: string }) => c.id)).toEqual(
      expect.arrayContaining([
        'radios-em-destaque',
        'radio-br-genre',
        'radio-br-catalog',
        'radio-br-region',
        'radio-br-state',
      ]),
    )
    const genreCatalog = manifest.catalogs.find(
      (catalog: { id: string }) => catalog.id === 'radio-br-genre',
    )
    expect(genreCatalog?.extra?.[0]).toMatchObject({
      name: 'genre',
      options: expect.arrayContaining(['Sertanejo', 'Outros gêneros']),
    })
    for (const [field, width, height] of [
      ['logo', 256, 256],
      ['background', 1600, 900],
    ] as const) {
      const asset = await fetch(base + new URL(manifest[field]).pathname)
      expect(asset.status).toBe(200)
      expect(asset.headers.get('content-type')).toContain('image/png')
      const png = Buffer.from(await asset.arrayBuffer())
      expect(png.subarray(1, 4).toString()).toBe('PNG')
      expect(png.readUInt32BE(16)).toBe(width)
      expect(png.readUInt32BE(20)).toBe(height)
    }
    const original = await (
      await fetch(`${base}/catalog/tv/radio-br-catalog.json`)
    ).json()
    const editorial = await (
      await fetch(`${base}/catalog/tv/radios-em-destaque.json`)
    ).json()
    expect(original.metas[0].id).toBe(`radio-br:${sertanejoUuid}`)
    expect(editorial.metas.length).toBeGreaterThan(0)

    const genre = await (
      await fetch(`${base}/catalog/tv/radio-br-genre/genre=Sertanejo.json`)
    ).json()
    expect(genre.metas.map((meta: { id: string }) => meta.id)).toEqual([
      `radio-br:${sertanejoUuid}`,
    ])
    const noticias = await (
      await fetch(
        `${base}/catalog/tv/radio-br-genre/genre=${encodeURIComponent('Notícias e esportes')}.json`,
      )
    ).json()
    expect(noticias.metas.map((meta: { id: string }) => meta.id)).toEqual([
      `radio-br:${validStation.stationuuid}`,
    ])
    const unknownGenre = await (
      await fetch(`${base}/catalog/tv/radio-br-genre/genre=Inexistente.json`)
    ).json()
    expect(unknownGenre.metas).toEqual([])
    const unfilteredGenre = await (
      await fetch(`${base}/catalog/tv/radio-br-genre.json`)
    ).json()
    expect(unfilteredGenre.metas).toHaveLength(2)

    expect(fetcher).toHaveBeenCalledTimes(1)
    const stream = await (
      await fetch(`${base}/stream/tv/radio-br:${validStation.stationuuid}.json`)
    ).json()
    expect(stream.streams[0].url).toBe(validStation.url_resolved)
    const search = await fetch(
      `${base}/catalog/tv/radios-em-destaque/search=Prova.json`,
    )
    expect(search.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
  } finally {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
})

it('uses the configured public origin and rejects non-HTTP image origins', () => {
  expect(createManifest('https://radio.example').logo).toBe(
    'https://radio.example/assets/logo.png',
  )
  expect(() => createManifest('file:///tmp')).toThrow('HTTP(S)')
})
