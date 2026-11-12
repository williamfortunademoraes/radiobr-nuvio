import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import { createApp } from '../../src/server.js'
import { RadioBrowserClient } from '../../src/radio-browser/client.js'
import { validStation } from '../fixtures/station.js'
import {
  buildCatalogs,
  defaultConfig,
  encodeConfig,
  parseConfigSegment,
  validateConfig,
} from '../../src/config/addon-config.js'

const config = {
  ...defaultConfig(),
  c: ['featured'] as const,
  g: ['sertanejo', 'gospel'] as const,
  s: ['RJ', 'SP'] as const,
}
const payload = {
  v: 1,
  c: [...config.c],
  g: [...config.g],
  s: [...config.s],
  o: { logos: false },
}
let server: Server
let base: string
const fetcher = vi.fn(
  async () =>
    new Response(
      JSON.stringify([
        { ...validStation, tags: 'sertanejo', state: 'SP' },
        {
          ...validStation,
          stationuuid: '22222222-2222-4222-8222-222222222222',
          tags: 'gospel',
          state: 'RJ',
        },
        {
          ...validStation,
          stationuuid: '33333333-3333-4333-8333-333333333333',
          tags: 'rock',
          state: 'MG',
        },
      ]),
    ),
)
beforeAll(async () => {
  const app = createApp({
    client: new RadioBrowserClient(undefined, fetcher),
    baseUrl: 'https://radio.example',
  })
  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address()
  base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`
})
afterAll(async () => {
  server.closeAllConnections()
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

it.each(['/', '/personalizar', '/configure'])(
  'serves the RADIO BR page at %s',
  async (route) => {
    const response = await fetch(base + route)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('RADIO BR')
  },
)
it('canonicalizes multiple choices and persists by URL', () => {
  const result = validateConfig(payload)
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error(result.error)
  const encoded = encodeConfig(result.config)
  expect(parseConfigSegment(encoded)).toEqual(result)
  const reordered = validateConfig({
    ...payload,
    s: ['SP', 'RJ'],
    g: ['gospel', 'sertanejo'],
  })
  expect(reordered).toEqual(result)
})
it.each([
  {},
  { v: 1 },
  { v: 2, c: ['all'] },
  { c: ['invalid'] },
  { c: ['all'], s: ['XX'] },
  { c: ['all'], g: ['x'] },
  { c: ['all'], o: { logos: 'false' } },
  { c: ['all'], url: 'https://evil.test' },
  { perfil: 'invalid' },
  { c: ['all'], o: { city: 'X' } },
])('rejects invalid configuration %j', (value) => {
  expect(validateConfig(value).ok).toBe(false)
})
it('limits configuration size', () => {
  expect(parseConfigSegment('x'.repeat(2049)).ok).toBe(false)
})
it.each([
  ['{', 400],
  [JSON.stringify({ c: ['all'], extra: 'x'.repeat(2100) }), 413],
  [JSON.stringify({ v: 1, c: [], g: [] }), 400],
])('rejects invalid generation body', async (body, status) => {
  const response = await fetch(base + '/api/configuration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  expect(response.status).toBe(status)
})
it('rejects malformed percent encoding', async () => {
  expect((await fetch(base + '/%E0%A4%A/manifest.json')).status).toBe(400)
})
it('keeps default regional catalogs but restricts personalized states', () => {
  expect(
    buildCatalogs(defaultConfig()).filter((c) =>
      c.id.startsWith('radio-br-region-'),
    ),
  ).toHaveLength(27)
  const result = validateConfig(payload)
  if (!result.ok) throw new Error(result.error)
  expect(
    buildCatalogs(result.config)
      .filter((c) => c.id.startsWith('radio-br-region-'))
      .map((c) => c.id),
  ).toEqual(['radio-br-region-rj', 'radio-br-region-sp'])
})
it('generates a canonical public URL and its dynamic manifest on the server', async () => {
  const response = await fetch(base + '/api/configuration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body.url).toMatch(/^https:\/\/radio.example\/%7B/)
  const manifest = await (await fetch(base + new URL(body.url).pathname)).json()
  expect(manifest).toEqual(body.manifest)
  expect(manifest.catalogs.map((c: { id: string }) => c.id)).not.toContain(
    'radio-br-catalog',
  )
})
it.each([
  'manifest.json',
  'catalog/tv/radio-br-catalog.json',
  `meta/tv/radio-br:${validStation.stationuuid}.json`,
  `stream/tv/radio-br:${validStation.stationuuid}.json`,
])('rejects invalid URL config before %s', async (resource) => {
  expect((await fetch(`${base}/%7B%7D/${resource}`)).status).toBe(400)
})
it('filters catalogs and metadata while preserving streams and shared cache', async () => {
  const prefix = `${base}/${encodeURIComponent(JSON.stringify(payload))}`
  const json = async (route: string) => (await fetch(prefix + route)).json()
  expect((await json('/catalog/tv/radio-br-featured.json')).metas).toHaveLength(
    2,
  )
  expect(
    (await json('/catalog/tv/radio-br-genre-sertanejo.json')).metas[0],
  ).not.toHaveProperty('poster')
  expect((await json('/catalog/tv/radio-br-region-mg.json')).metas).toEqual([])
  expect((await json('/catalog/tv/radio-br-genre-rock.json')).metas).toEqual([])
  expect(
    (await json(`/meta/tv/radio-br:${validStation.stationuuid}.json`)).meta,
  ).not.toHaveProperty('poster')
  expect(
    (await json(`/stream/tv/radio-br:${validStation.stationuuid}.json`))
      .streams[0].url,
  ).toBe(validStation.url_resolved)
  expect(fetcher).toHaveBeenCalledTimes(1)
})
