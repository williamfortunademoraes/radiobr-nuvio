import { describe, expect, it } from 'vitest'
import { radiosEmDestaque } from '../../src/editorial/radios-em-destaque.js'

describe('radios em destaque', () => {
  it('mantém as 13 emissoras na ordem editorial estável', () => {
    expect(radiosEmDestaque.enabled).toBe(true)
    expect(radiosEmDestaque.showOnHome).toBe(true)
    expect(radiosEmDestaque.items).toHaveLength(13)
    expect(radiosEmDestaque.items.map((item) => item.id)).toEqual([
      'radio-itatiaia',
      'radio-tupi',
      'jovem-pan-fm',
      'jovem-pan-news',
      'radio-gaucha',
      'radio-bandeirantes',
      'fm-o-dia',
      'cbn',
      'bandnews-fm',
      'alpha-fm',
      '89-a-radio-rock',
      'radio-mix-fm',
      'antena-1',
    ])
  })

  it('não transforma ausência de dados em informação inventada', () => {
    const jovemPanNews = radiosEmDestaque.items.find(
      (item) => item.id === 'jovem-pan-news',
    )!
    expect(jovemPanNews.streamUrl).toBeUndefined()
    expect(jovemPanNews.logoUrl).toBeUndefined()
  })
})
