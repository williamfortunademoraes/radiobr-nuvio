import { describe, expect, it, vi } from 'vitest'
import {
  createMetadataService,
  stationDescription,
} from '../../src/metadata/metadata.js'
import { validStation } from '../fixtures/station.js'
import { radiosEmDestaque } from '../../src/editorial/radios-em-destaque.js'
import type { EnrichmentSnapshot } from '../../src/enrichment/snapshot.js'
describe('metadata', () => {
  it('does not manufacture a TV channel for a genre collection', async () => {
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([]),
    } as never).getMetadata({ type: 'tv', id: 'radio-br-genre-sertanejo' })

    expect(result).toEqual({ meta: {} })
  })

  it('exposes available station details without inventing fields', async () => {
    const station = {
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      countryCode: 'BR' as const,
      tags: ['news'],
      city: 'Rio de Janeiro',
      slogan: 'A rádio que informa você',
      hls: false,
    }
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([station]),
    } as never).getMetadata({ type: 'tv', id: station.id })
    expect(result.meta).toMatchObject({
      id: station.id,
      name: station.name,
      poster: station.favicon,
    })
    const description = (result.meta as { description?: string }).description!
    expect(description.split('\n')[0]).toBe(
      'Rádio Prova – A rádio que informa você',
    )
    expect(description).not.toContain('Sobre:')
    expect(description).toContain('Cidade: Rio de Janeiro')
    expect(description).toContain('Estado: SP')
    expect(description).toContain('Gênero: Notícias e esportes')
    expect(description).not.toContain('Slogan:')
    expect(description).not.toContain('https://')
    expect(description).not.toContain('portuguese')
    expect(description).not.toContain('Brasil')
    await expect(
      createMetadataService({ searchStations: vi.fn() } as never).getMetadata({
        type: 'tv',
        id: 'bad',
      }),
    ).resolves.toEqual({ meta: {} })
  })

  it('omits the slogan line when the station has no slogan', () => {
    expect(
      stationDescription({
        ...validStation,
        id: `radio-br:${validStation.stationuuid}`,
        stationUuid: validStation.stationuuid!,
        name: 'Rádio sem slogan',
        tags: ['pop'],
        countryCode: 'BR',
        hls: false,
      }),
    ).not.toContain('Slogan')
  })

  it('shows Sobre only when a station history is provided', () => {
    const description = stationDescription({
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: 'Rádio Jazz 99.9 FM',
      city: 'São Paulo',
      state: 'SP',
      tags: ['smooth jazz'],
      about: 'Fundada em 1985, dedica-se ao jazz e à música instrumental.',
      countryCode: 'BR',
      hls: false,
    })
    expect(description).toContain(
      'Sobre: Fundada em 1985, dedica-se ao jazz e à música instrumental.',
    )
  })

  it('uses the provided FM O Dia history', async () => {
    const station = {
      ...validStation,
      id: 'radio-br:fm-o-dia',
      stationUuid: 'fm-o-dia',
      name: 'FM O DIA 100.5',
      tags: ['pop'],
      countryCode: 'BR' as const,
      hls: false,
    }
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([station]),
    } as never).getMetadata({ type: 'tv', id: station.id })
    expect((result.meta as { description?: string }).description).toContain(
      'Sobre: O Rio de Janeiro tem muita música, irreverência, festa',
    )
  })

  it('uses the curated station logo instead of an unrelated favicon', async () => {
    const station = {
      ...validStation,
      id: 'radio-br:fm-o-dia',
      stationUuid: 'fm-o-dia',
      name: 'FM O DIA 100.5',
      favicon: 'https://radio.example/favicon-99-7.png',
      tags: ['pop'],
      countryCode: 'BR' as const,
      hls: false,
    }
    const result = await createMetadataService(
      { searchStations: vi.fn().mockResolvedValue([station]) } as never,
      undefined,
      'https://radio.example',
    ).getMetadata({ type: 'tv', id: station.id })
    expect(result.meta).toMatchObject({
      poster:
        'https://radio.example/assets/logos/stations/fm-o-dia-100-5-landscape.jpg',
    })
  })

  it('translates common English genre terms in the radio description', () => {
    const description = stationDescription({
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: 'Rádio com gêneros traduzidos',
      tags: ['adult contemporary', 'smooth jazz', 'flashback', 'news'],
      countryCode: 'BR',
      hls: false,
    })

    expect(description).toContain(
      'Gênero: Adulto contemporâneo, Jazz suave, Flashback, Notícias e esportes',
    )
    expect(description).not.toContain('adult contemporary')
    expect(description).not.toContain('smooth jazz')
  })

  it('shows an explicit frequency above the station location', () => {
    const description = stationDescription({
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: 'Rádio Exemplo 99.9 FM',
      city: 'São Paulo',
      state: 'SP',
      tags: ['news'],
      countryCode: 'BR',
      hls: false,
    })

    expect(description.split('\n')).toEqual(
      expect.arrayContaining(['Frequência: 99,9 FM', 'Cidade: São Paulo']),
    )
    expect(description.indexOf('Frequência:')).toBeLessThan(
      description.indexOf('Cidade:'),
    )
  })

  it('shows multiple explicit frequencies without inventing a value', () => {
    const description = stationDescription({
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: 'Rádio Exemplo 610 AM 95.7 FM',
      tags: ['news'],
      countryCode: 'BR',
      hls: false,
    })

    expect(description).toContain('Frequência: 610 AM, 95,7 FM')
  })

  it('omits the frequency line when the name has no explicit frequency', () => {
    const description = stationDescription({
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      name: 'Rádio Exemplo',
      tags: ['news'],
      countryCode: 'BR',
      hls: false,
    })

    expect(description).not.toContain('Frequência:')
  })

  it('applies an optional enrichment snapshot without changing the station id', async () => {
    const snapshot: EnrichmentSnapshot = {
      version: 1,
      generatedAt: '2026-11-12T00:00:00.000Z',
      records: [
        {
          stationUuid: validStation.stationuuid!,
          data: {
            state: 'RJ',
            stateName: 'Rio de Janeiro',
            categories: ['Pop'],
            slogan: 'A rádio atual',
            logo: 'https://official.example/logo.png',
          },
          provenance: {},
          updatedAt: '2026-11-12T00:00:00.000Z',
        },
      ],
      failures: [],
    }
    const station = {
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      countryCode: 'BR' as const,
      tags: ['news'],
      hls: false,
    }
    const result = await createMetadataService(
      { searchStations: vi.fn().mockResolvedValue([station]) } as never,
      snapshot,
    ).getMetadata({ type: 'tv', id: station.id })
    expect(result.meta).toMatchObject({
      id: station.id,
      poster: 'https://official.example/logo.png',
    })
    expect((result.meta as { description?: string }).description).toContain(
      'Estado: RJ - Rio de Janeiro',
    )
    const description = (result.meta as { description?: string }).description!
    expect(description.split('\n')[0]).toBe('Rádio Prova – A rádio atual')
    expect(description).not.toContain('Slogan:')
  })

  it('keeps editorial radio descriptions free of country wording', async () => {
    const item =
      radiosEmDestaque.items.find((entry) => !entry.city) ??
      radiosEmDestaque.items[0]
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([]),
    } as never).getMetadata({
      type: 'tv',
      id: `radio-br:editorial:${item.id}`,
    })
    expect((result.meta as { description?: string }).description).not.toContain(
      'Rede nacional',
    )
  })

  it('resolves Top 25 editorial stations with existing Radio Browser logos', async () => {
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([
        {
          ...validStation,
          id: 'radio-br:gaucha',
          stationUuid: 'gaucha',
          name: 'Rádio Gaúcha',
          state: 'RS',
        },
      ]),
    } as never).getMetadata({
      type: 'tv',
      id: 'radio-br:editorial:top25-1',
    })
    expect(result.meta).toMatchObject({
      name: 'Rádio Gaúcha 93.7 FM',
      poster: validStation.favicon,
    })
    expect((result.meta as { description?: string }).description).toContain(
      'Disponível para reprodução',
    )
  })

  it('uses the editorial city and UF once for a featured station', async () => {
    const result = await createMetadataService({
      searchStations: vi.fn().mockResolvedValue([
        {
          ...validStation,
          id: 'radio-br:tupi',
          stationUuid: 'tupi',
          name: 'Super Rádio Tupi',
          state: 'Rio de Janeiro',
          city: undefined,
        },
      ]),
    } as never).getMetadata({
      type: 'tv',
      id: 'radio-br:editorial:top25-3',
    })

    const description = (result.meta as { description?: string }).description!
    expect(description).toContain('Cidade: Rio de Janeiro')
    expect(description).toContain('Estado: RJ')
    expect(description).not.toContain('Estado: Rio de Janeiro')
    expect(description.match(/Estado:/g)).toHaveLength(1)
  })
})
