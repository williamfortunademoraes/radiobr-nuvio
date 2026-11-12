import type { EditorialCollection, EditorialRadio } from './types.js'

const sourceUrl = 'https://radiosbrasil.com.br/radios-mais-ouvidas/'
const logo = (url: string): Pick<EditorialRadio, 'logoUrl' | 'logoSource'> => ({
  logoUrl: url,
  logoSource: sourceUrl,
})

export const radiosEmDestaque: EditorialCollection = {
  id: 'radios-em-destaque',
  name: 'Rádios em Destaque',
  type: 'editorial',
  scope: 'national-and-regional',
  ordering: 'manual',
  enabled: true,
  showOnHome: true,
  items: [
    {
      id: 'radio-itatiaia',
      name: 'Rádio Itatiaia',
      category: 'Notícias e esportes',
      city: 'Belo Horizonte',
      state: 'MG',
      frequency: '610 AM / 95.7 FM',
      sourceUrl,
      ...logo(
        'https://radiosbrasil.com.br/wp-content/uploads/elementor/thumbs/Radio-Itatiaia-qkizmwizh9fih5dwu5to5588tl6y7qox4ltjb36zd8.webp',
      ),
    },
    {
      id: 'radio-tupi',
      name: 'Super Rádio Tupi',
      category: 'Notícias e entretenimento',
      city: 'Rio de Janeiro',
      state: 'RJ',
      frequency: '96.5 FM',
      sourceUrl,
      ...logo(
        'https://radiosbrasil.com.br/wp-content/uploads/elementor/thumbs/Radio-Tupi-FM-96.5-qsnq2fdrmwvgrxnfirz7318q4k3e3czeupe6qrgm8c.webp',
      ),
    },
    {
      id: 'jovem-pan-fm',
      name: 'Jovem Pan FM',
      category: 'Música',
      city: 'São Paulo',
      state: 'SP',
      sourceUrl,
    },
    {
      id: 'jovem-pan-news',
      name: 'Jovem Pan News',
      category: 'Notícias',
      sourceUrl,
    },
    {
      id: 'radio-gaucha',
      name: 'Rádio Gaúcha',
      category: 'Notícias e esportes',
      city: 'Porto Alegre',
      state: 'RS',
      sourceUrl,
    },
    {
      id: 'radio-bandeirantes',
      name: 'Rádio Bandeirantes',
      category: 'Notícias e esportes',
      city: 'São Paulo',
      state: 'SP',
      sourceUrl,
    },
    {
      id: 'fm-o-dia',
      name: 'FM O Dia',
      category: 'Música',
      city: 'Rio de Janeiro',
      state: 'RJ',
      frequency: '100.5 FM',
      sourceUrl,
      ...logo(
        'https://radiosbrasil.com.br/wp-content/uploads/elementor/thumbs/Radio-FM-o-Dia-qkiz652llmhffhqgpwz6odibg7tay258tmzt7g1qbw.webp',
      ),
    },
    { id: 'cbn', name: 'CBN', category: 'Notícias', sourceUrl },
    {
      id: 'bandnews-fm',
      name: 'BandNews FM',
      category: 'Notícias',
      sourceUrl,
      ...logo(
        'https://radiosbrasil.com.br/wp-content/uploads/elementor/thumbs/radio24477_1579261235-qvvzkc6fi1kp4rktcmsl0hl439ulequg54du0dtk0c.webp',
      ),
    },
    {
      id: 'alpha-fm',
      name: 'Alpha FM',
      category: 'Música',
      city: 'São Paulo',
      state: 'SP',
      sourceUrl,
    },
    {
      id: '89-a-radio-rock',
      name: '89 FM A Rádio Rock',
      category: 'Rock',
      city: 'São Paulo',
      state: 'SP',
      sourceUrl,
    },
    {
      id: 'radio-mix-fm',
      name: 'Rádio Mix FM',
      category: 'Música',
      sourceUrl,
      ...logo(
        'https://radiosbrasil.com.br/wp-content/uploads/elementor/thumbs/Radio-Mix-Rio-qkjo7ye8kf00b9srr8aieazwvkvuvxabt7fbrgx2mk.webp',
      ),
    },
    { id: 'antena-1', name: 'Antena 1', category: 'Música', sourceUrl },
  ],
}

export function findEditorialRadioById(id: string) {
  return radiosEmDestaque.items.find((item) => item.id === id)
}
