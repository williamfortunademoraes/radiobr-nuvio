import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { EnrichmentHttpClient } from '../src/enrichment/http.js'
import {
  parseOfficialWebsite,
  parseRadiosComBr,
  type ParsedSource,
} from '../src/enrichment/sources/html.js'
import { RadioBrowserEnrichmentAdapter } from '../src/enrichment/sources/radio-browser.js'
import { validateLogo } from '../src/enrichment/logo.js'
import { runEnrichment } from '../src/enrichment/runner.js'
import { writeEnrichmentSnapshot } from '../src/enrichment/storage.js'
import { RadioBrowserClient } from '../src/radio-browser/client.js'
import { matchTop25Editorial } from '../src/editorial/top-25-match.js'
import { top25Ranking } from '../src/editorial/top-25-ranking.js'

const checkedAt = new Date().toISOString()
const output = 'data/enrichment/stations.json'
const baseUrl = process.env.ADDON_BASE_URL
const http = new EnrichmentHttpClient(fetch, { retries: 2, backoffMs: 500 })
const radioBrowser = new RadioBrowserEnrichmentAdapter()

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const curatedLogos: Record<string, string> = {
  [normalize('Rádio FM O Dia 100.5')]: 'fm-o-dia-100-5.png',
  [normalize('Rádio Nativa 95.3 FM')]: 'nativa-95-3.png',
  [normalize('Rádio Jovem Pan News')]: 'jovem-pan-news.png',
  [normalize('Rádio Liberdade 92.9 FM')]: 'liberdade-92-9.png',
}

async function candidateFromPage(
  url: string,
  source: 'radios-com-br' | 'official-website',
  parser: (html: string, url: string, checkedAt: string) => ParsedSource,
) {
  const response = await http.request(url)
  const parsed = parser(await response.text(), url, checkedAt)
  const data = { ...parsed.data }
  const provenance = { ...parsed.provenance }
  if (typeof data.logo === 'string') {
    const logoResponse = await http.request(data.logo)
    const logo = await validateLogo(logoResponse, data.logo, source, checkedAt)
    if (!logo) delete data.logo
  }
  return {
    source,
    data,
    provenance,
    checkedAt,
  }
}

const stations = await new RadioBrowserClient().searchAllStations()
const matchedTop25 = matchTop25Editorial(top25Ranking, stations)
const radiosUrls = new Map(
  matchedTop25.flatMap((entry) =>
    entry.station
      ? [
          [
            entry.station.stationUuid,
            `https://www.radios.com.br/aovivo/${entry.ranking.radiosComBrUrl}`,
          ] as const,
        ]
      : [],
  ),
)

const result = await runEnrichment({
  stations,
  now: checkedAt,
  concurrency: 3,
  lookup: async (station) => {
    const candidates = [radioBrowser.lookup(station, checkedAt)]
    const radiosUrl = radiosUrls.get(station.stationUuid)
    if (radiosUrl) {
      try {
        candidates.push(
          await candidateFromPage(radiosUrl, 'radios-com-br', parseRadiosComBr),
        )
      } catch {
        // A source failure must not prevent the official-site fallback.
      }
    }
    if (station.homepage) {
      try {
        candidates.push(
          await candidateFromPage(
            station.homepage,
            'official-website',
            parseOfficialWebsite,
          ),
        )
      } catch {
        // A source failure is recorded by the next run/report layer.
      }
    }
    const curated = curatedLogos[normalize(station.name)]
    if (curated && baseUrl) {
      const logo = new URL(`/assets/logos/stations/${curated}`, baseUrl).href
      candidates.push({
        source: 'user',
        data: { logo },
        provenance: {
          logo: {
            source: 'user',
            url: logo,
            checkedAt,
            status: 'verified',
            note: 'Logo fornecido ou validado pelo usuário',
          },
        },
        checkedAt,
      })
    }
    return candidates
  },
})

await mkdir(dirname(output), { recursive: true })
writeEnrichmentSnapshot(output, result.snapshot)
console.log(
  JSON.stringify(
    {
      output,
      processed: result.processed,
      failed: result.failed,
      records: result.snapshot.records.length,
    },
    null,
    2,
  ),
)
