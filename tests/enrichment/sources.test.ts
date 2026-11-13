import { describe, expect, it, vi } from 'vitest'
import {
  EnrichmentHttpClient,
  type Fetcher,
} from '../../src/enrichment/http.js'
import {
  parseOfficialWebsite,
  parseRadiosComBr,
} from '../../src/enrichment/sources/html.js'
import { RadioBrowserEnrichmentAdapter } from '../../src/enrichment/sources/radio-browser.js'
import type { Station } from '../../src/stations/types.js'

const response = (status: number, body = '') =>
  new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })

describe('enrichment HTTP policy', () => {
  it('retries a transient 503 once and then returns the response', async () => {
    const fetcher = vi
      .fn<Fetcher>()
      .mockResolvedValueOnce(response(503))
      .mockResolvedValueOnce(response(200, '<html>ok</html>'))
    const client = new EnrichmentHttpClient(fetcher, {
      retries: 1,
      backoffMs: 0,
    })

    const result = await client.request('https://radio.example')

    expect(result.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('records a blocked source without retrying a 403', async () => {
    const fetcher = vi.fn<Fetcher>().mockResolvedValue(response(403))
    const client = new EnrichmentHttpClient(fetcher, {
      retries: 2,
      backoffMs: 0,
    })

    await expect(client.request('https://radio.example')).rejects.toMatchObject(
      {
        status: 403,
      },
    )
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})

describe('source parsers', () => {
  it('extracts Radios.com.br fields and logo metadata', () => {
    const result = parseRadiosComBr(
      '<meta property="og:image" content="https://img.example/logo.png"><div>Slogan: A rádio do povo</div><div>Cidade: Recife</div><div>Estado: PE</div><div>Gênero: Popular, Notícias</div>',
      'https://radios.com.br/radio/1',
      '2026-11-12T00:00:00.000Z',
    )

    expect(result.data).toEqual({
      city: 'Recife',
      state: 'PE',
      categories: ['Popular', 'Notícias'],
      slogan: 'A rádio do povo',
      logo: 'https://img.example/logo.png',
    })
    expect(result.provenance.logo?.source).toBe('radios-com-br')
  })

  it('extracts official JSON-LD and Open Graph data', () => {
    const result = parseOfficialWebsite(
      '<meta property="og:image" content="https://official.example/logo.jpg"><script type="application/ld+json">{"name":"Rádio Exemplo","address":{"addressLocality":"Natal","addressRegion":"RN"}}</script>',
      'https://official.example',
      '2026-11-12T00:00:00.000Z',
    )

    expect(result.data).toMatchObject({
      name: 'Rádio Exemplo',
      city: 'Natal',
      state: 'RN',
      logo: 'https://official.example/logo.jpg',
    })
  })
})

describe('Radio Browser adapter', () => {
  it('maps complementary station data without replacing the station identity', () => {
    const station: Station = {
      id: 'radio-br:uuid',
      stationUuid: 'uuid',
      name: 'Rádio Exemplo',
      countryCode: 'BR',
      city: 'Belém',
      state: 'PA',
      tags: ['popular', 'news'],
      favicon: 'https://radio.example/logo.png',
      homepage: 'https://radio.example',
      url: 'https://radio.example/stream',
      hls: false,
    }

    const result = new RadioBrowserEnrichmentAdapter().lookup(station)

    expect(result.data).toEqual({
      name: 'Rádio Exemplo',
      city: 'Belém',
      state: 'PA',
      categories: ['popular', 'news'],
    })
    expect(result.data.logo).toBeUndefined()
    expect(result.provenance.name?.source).toBe('radio-browser')
  })
})
