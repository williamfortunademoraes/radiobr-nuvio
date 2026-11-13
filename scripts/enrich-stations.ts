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
import {
  loadEnrichmentSnapshot,
  writeEnrichmentSnapshot,
} from '../src/enrichment/storage.js'
import { RadioBrowserClient } from '../src/radio-browser/client.js'
import { matchTop25Editorial } from '../src/editorial/top-25-match.js'
import { top25Ranking } from '../src/editorial/top-25-ranking.js'
import type { EnrichmentFailure } from '../src/enrichment/types.js'

const checkedAt = new Date().toISOString()
const output = 'data/enrichment/stations.json'
const previous = loadEnrichmentSnapshot(output)
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
  [normalize('Rádio Gaúcha 93.7 FM')]: 'gaucha-93-7.png',
  [normalize('Antena 1')]: 'antena-1-94-7.png',
  [normalize('Rádio Antena 1 94.7 FM')]: 'antena-1-94-7.png',
  [normalize('Rádio Bandeirantes')]: 'bandeirantes-107-3.jfif',
  [normalize('Rádio Bandeirantes 107.3 FM')]: 'bandeirantes-107-3.jfif',
  [normalize('CBN São Paulo')]: 'cbn-sao-paulo-90-5.png',
  [normalize('Rádio CBN São Paulo 90.5 FM')]: 'cbn-sao-paulo-90-5.png',
  [normalize('Rádio Band 96.1 FM')]: 'band-96-1.png',
  [normalize('Rádio Grenal 95.9 FM')]: 'grenal-95-9.png',
  [normalize('Rádio JB FM 99.9')]: 'jb-fm-99-9.png',
  [normalize('Rádio 89 FM Rádio Rock')]: 'radio-89-rock.webp',
  [normalize('FM O Dia')]: 'fm-o-dia-100-5.png',
  [normalize('Rádio FM O Dia 100.5')]: 'fm-o-dia-100-5.png',
  [normalize('Itatiaia')]: 'itatiaia-610-am-95-7.jpg',
  [normalize('Rádio Itatiaia 610 AM 95.7 FM')]: 'itatiaia-610-am-95-7.jpg',
  [normalize('Nativa')]: 'nativa-95-3.png',
  [normalize('Rádio Nativa 95.3 FM')]: 'nativa-95-3.png',
  [normalize('Rádio Jovem Pan News')]: 'jovem-pan-news.png',
  [normalize('Rádio Liberdade 92.9 FM')]: 'liberdade-92-9.jpg',
  [normalize('Rádio Aparecida 104.3 FM')]: 'aparecida-104-3.jpg',
  [normalize('Rádio Jornal de Recife 90.3 FM')]: 'jornal-recife-90-3.jpg',
  [normalize('Rádio Melodia 97.5 FM')]: 'melodia-97-5.png',
  [normalize('Rádio TMC 100.1 FM')]: 'tmc-100-1.webp',
  [normalize('Rádio Kiss FM 92.5')]: 'kiss-92-5.png',
  [normalize('Rádio Flashback')]: 'flashback.png',
  [normalize('Smooth Jazz Lounge Radio')]: 'smooth-jazz-lounge.jpg',
  [normalize('Rádio Clube 105.5 FM')]: 'clube-105-5.png',
  [normalize('Rádio Alpha 101.7 FM')]: 'alpha-101-7.jpg',
  [normalize('Rádio Metropolitana 98.5 FM')]: 'metropolitana-98-5.png',
  [normalize('Saudade')]: 'saudade-99-7.png',
  [normalize('Radio Saudade 99.7 FM')]: 'saudade-99-7.png',
  [normalize('Tupi')]: 'tupi-96-5.png',
  [normalize('Super Rádio Tupi 96.5 FM')]: 'tupi-96-5.png',
}

function curatedLogoFor(stationName: string): string | undefined {
  const name = normalize(stationName)
  const exact = curatedLogos[name]
  if (exact) return exact
  return Object.entries(curatedLogos).find(([key]) => name.includes(key))?.[1]
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
  previous,
  lookup: async (station) => {
    const candidates = [radioBrowser.lookup(station, checkedAt)]
    const failures: EnrichmentFailure[] = []
    const radiosUrl = radiosUrls.get(station.stationUuid)
    if (radiosUrl) {
      try {
        candidates.push(
          await candidateFromPage(radiosUrl, 'radios-com-br', parseRadiosComBr),
        )
      } catch {
        failures.push({
          source: 'radios-com-br',
          stationUuid: station.stationUuid,
          url: radiosUrl,
          error: 'Falha ao consultar Radios.com.br',
        })
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
        failures.push({
          source: 'official-website',
          stationUuid: station.stationUuid,
          url: station.homepage,
          error: 'Falha ao consultar site oficial',
        })
      }
    }
    const curated = curatedLogoFor(station.name)
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
    return { candidates, failures }
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
