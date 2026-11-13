import { describe, expect, it, vi } from 'vitest'
import {
  createMetadataService,
  stationDescription,
} from '../../src/metadata/metadata.js'
import { validStation } from '../fixtures/station.js'
import { radiosEmDestaque } from '../../src/editorial/radios-em-destaque.js'
import type { EnrichmentSnapshot } from '../../src/enrichment/snapshot.js'
describe('metadata', () => {
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
    expect(description).toContain('Cidade: Rio de Janeiro')
    expect(description).toContain('Estado: SP')
    expect(description).toContain('Gênero: Notícias e esportes')
    expect(description).toContain('Slogan: A rádio que informa você')
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

  it('shows a Portuguese fallback when the station has no slogan', () => {
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
    ).toContain('Slogan: Não informado')
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
    expect((result.meta as { description?: string }).description).toContain(
      'Slogan: A rádio atual',
    )
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
})
