import { describe, expect, it } from 'vitest'
import { radiosEmDestaque } from '../../src/editorial/radios-em-destaque.js'

describe('radios em destaque', () => {
  it('mantém as 25 emissoras na ordem do ranking estável', () => {
    expect(radiosEmDestaque.enabled).toBe(true)
    expect(radiosEmDestaque.showOnHome).toBe(true)
    expect(radiosEmDestaque.items).toHaveLength(25)
    expect(radiosEmDestaque.items[0].id).toBe('top25-1')
    expect(radiosEmDestaque.items[24].id).toBe('top25-25')
  })

  it('não transforma ausência de dados em informação inventada', () => {
    const top25 = radiosEmDestaque.items.find((item) => item.id === 'top25-1')!
    expect(top25.streamUrl).toBeUndefined()
    expect(top25.logoUrl).toBeUndefined()
  })
})
