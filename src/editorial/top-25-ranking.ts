export interface Top25RankingEntry {
  position: number
  name: string
  location: string
  visits: number
  sourcePeriod: '2026-07'
  sourceUrl: string
  radiosComBrUrl: string
}

const sourceUrl = 'https://www.radios.com.br/estatistica/fm/2011/7?pais=33'

const rows = [
  [
    'Rádio Gaúcha 93.7 FM',
    'Porto Alegre / RS',
    '3009225',
    'radio-gaucha-937-fm/13176',
  ],
  [
    'Rádio Bandeirantes 107.3 FM',
    'São Paulo / SP',
    '2375196',
    'radio-bandeirantes-1073-fm/10410',
  ],
  [
    'Super Rádio Tupi 96.5 FM',
    'Rio de Janeiro / RJ',
    '1914211',
    'super-radio-tupi-965-fm/14215',
  ],
  [
    'Rádio Itatiaia 610 AM 95.7 FM',
    'Belo Horizonte / MG',
    '1745334',
    'radio-itatiaia-610-am-957-fm/14',
  ],
  [
    'Rádio Jovem Pan News',
    'São Paulo / SP',
    '1325320',
    'radio-jovem-pan-news/8800',
  ],
  [
    'Rádio CBN São Paulo 90.5 FM',
    'São Paulo / SP',
    '1127098',
    'radio-cbn-sao-paulo-905-fm/8816',
  ],
  [
    'Rádio BandNews SP 96.9 FM',
    'São Paulo / SP',
    '1064406',
    'radio-bandnews-sp-969-fm/24477',
  ],
  [
    'Rádio Grenal 95.9 FM',
    'Porto Alegre / RS',
    '1064060',
    'radio-grenal-959-fm/14075',
  ],
  [
    'Rádio Antena 1 94.7 FM',
    'São Paulo / SP',
    '1048595',
    'radio-antena-1-947-fm/9505',
  ],
  ['Radio Saudade 99.7 FM', 'Santos / SP', '756032', 'radio-saudade-997-fm/8'],
  ['Rádio Band 96.1 FM', 'São Paulo / SP', '726734', 'radio-band-961-fm/10358'],
  [
    'Rádio Nativa 95.3 FM',
    'São Paulo / SP',
    '608345',
    'radio-nativa-953-fm/14040',
  ],
  [
    'Rádio JB FM 99.9',
    'Rio de Janeiro / RJ',
    '560162',
    'radio-jb-fm-999/13654',
  ],
  [
    'Rádio Alpha 101.7 FM',
    'São Paulo / SP',
    '517324',
    'radio-alpha-1017-fm/9015',
  ],
  [
    'Rádio Metropolitana 98.5 FM',
    'São Paulo / SP',
    '455557',
    'radio-metropolitana-985-fm/13900',
  ],
  ['Rádio TMC 100.1 FM', 'São Paulo / SP', '419400', 'radio-tmc-1001-fm/8803'],
  [
    'Rádio 89 FM Rádio Rock',
    'São Paulo / SP',
    '412454',
    'radio-89-fm-radio-rock/31289',
  ],
  [
    'Rádio Jornal de Recife 90.3 FM',
    'Recife / PE',
    '411498',
    'radio-jornal-de-recife-903-fm/13488',
  ],
  [
    'Rádio Melodia 97.5 FM',
    'Rio de Janeiro / RJ',
    '411410',
    'radio-melodia-975-fm/13848',
  ],
  [
    'Rádio Aparecida 104.3 FM',
    'Aparecida / SP',
    '364969',
    'radio-aparecida-1043-fm/9571',
  ],
  [
    'Rádio FM O Dia 100.5',
    'Rio de Janeiro / RJ',
    '362443',
    'radio-fm-o-dia-1005/13213',
  ],
  [
    'Rádio Clube 105.5 FM',
    'Brasília / DF',
    '354956',
    'radio-clube-1055-fm/11839',
  ],
  ['Rádio Mix 106.3 FM', 'São Paulo / SP', '346816', 'radio-mix-1063-fm/13955'],
  [
    'Rádio Jangadeiro 88.9 FM',
    'Fortaleza / CE',
    '341332',
    'radio-jangadeiro-889-fm/13520',
  ],
  [
    'Rádio Liberdade 92.9 FM',
    'Belo Horizonte / MG',
    '340918',
    'radio-liberdade-929-fm/13590',
  ],
] as const

export const top25Ranking: readonly Top25RankingEntry[] = rows.map(
  ([name, location, visits, path], index) => ({
    position: index + 1,
    name,
    location,
    visits: Number(visits),
    sourcePeriod: '2026-07',
    sourceUrl,
    radiosComBrUrl: `https://www.radios.com.br/aovivo/${path}`,
  }),
)
