import type {
  EnrichedStationData,
  EnrichmentField,
  EnrichmentSource,
  FieldProvenance,
} from '../types.js'

interface ParsedSource {
  data: EnrichedStationData
  provenance: Partial<Record<EnrichmentField, FieldProvenance>>
}

function clean(value: string | undefined): string | undefined {
  const result = value
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return result || undefined
}

function meta(html: string, property: string): string | undefined {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i',
  )
  return clean(html.match(pattern)?.[1])
}

function labelled(html: string, label: string): string | undefined {
  return clean(html.match(new RegExp(`${label}\\s*:\\s*([^<\\n]+)`, 'i'))?.[1])
}

function parsed(
  source: EnrichmentSource,
  url: string,
  checkedAt: string,
  data: EnrichedStationData,
): ParsedSource {
  const provenance = Object.fromEntries(
    Object.keys(data).map((field) => [
      field,
      {
        source,
        url,
        checkedAt,
        status: 'verified',
      },
    ]),
  ) as Partial<Record<EnrichmentField, FieldProvenance>>
  return { data, provenance }
}

export function parseRadiosComBr(
  html: string,
  url: string,
  checkedAt: string,
): ParsedSource {
  const categories = labelled(html, 'Gênero')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return parsed('radios-com-br', url, checkedAt, {
    city: labelled(html, 'Cidade'),
    state: labelled(html, 'Estado'),
    categories: categories?.length ? categories : undefined,
    slogan: labelled(html, 'Slogan'),
    logo: meta(html, 'og:image'),
  })
}

function jsonLd(html: string): Record<string, unknown> | undefined {
  const content = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
  )?.[1]
  if (!content) return undefined
  try {
    const value: unknown = JSON.parse(content)
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : undefined
  } catch {
    return undefined
  }
}

export function parseOfficialWebsite(
  html: string,
  url: string,
  checkedAt: string,
): ParsedSource {
  const data = jsonLd(html)
  const address = data?.address
  const location =
    typeof address === 'object' && address !== null
      ? (address as Record<string, unknown>)
      : undefined
  return parsed('official-website', url, checkedAt, {
    name: typeof data?.name === 'string' ? data.name : undefined,
    city:
      typeof location?.addressLocality === 'string'
        ? location.addressLocality
        : undefined,
    state:
      typeof location?.addressRegion === 'string'
        ? location.addressRegion
        : undefined,
    slogan: labelled(html, 'Slogan'),
    logo: meta(html, 'og:image'),
  })
}
