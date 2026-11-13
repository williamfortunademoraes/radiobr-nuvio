import { describe, expect, it, vi } from 'vitest'
import { createMetadataService } from '../../src/metadata/metadata.js'
import { validStation } from '../fixtures/station.js'
import { radiosEmDestaque } from '../../src/editorial/radios-em-destaque.js'
describe('metadata', () => {
  it('exposes available station details without inventing fields', async () => {
    const station = {
      ...validStation,
      id: `radio-br:${validStation.stationuuid}`,
      stationUuid: validStation.stationuuid!,
      countryCode: 'BR' as const,
      tags: ['news'],
      city: 'Rio de Janeiro',
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
    expect(description).toContain(
      'Cidade: [Rio de Janeiro](https://radiosbrasil.com.br/cidades/rio-de-janeiro/)',
    )
    expect(description).toContain(
      'Estado: [SP](https://radiosbrasil.com.br/estados/sp/)',
    )
    expect(description).toContain(
      'Gênero: [News](https://radiosbrasil.com.br/generos/news/)',
    )
    expect(description).not.toContain('portuguese')
    expect(description).not.toContain('Brasil')
    await expect(
      createMetadataService({ searchStations: vi.fn() } as never).getMetadata({
        type: 'tv',
        id: 'bad',
      }),
    ).resolves.toEqual({ meta: {} })
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
