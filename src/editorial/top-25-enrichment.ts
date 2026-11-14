import { top25Ranking } from './top-25-ranking.js'

export interface Top25Enrichment {
  slogan: string
  website: string
  radiosComBrUrl: string
  about: string
  sources: {
    slogan: string
    website: string
    radiosComBrUrl: string
    about: string
    checkedAt: string
  }
}

const checkedAt = '2026-11-14'

const editorial: Record<number, Omit<Top25Enrichment, 'radiosComBrUrl'>> = {
  1: {
    slogan: 'A tua voz',
    website: 'https://gauchazh.clicrbs.com.br/',
    about:
      'Rádio do Grupo RBS com jornalismo, esporte e informação sobre o Rio Grande do Sul e o mundo.',
    sources: {
      slogan: 'https://gauchazh.clicrbs.com.br/',
      website: 'https://www.gruporbs.com.br/nossas-marcas/6/gaucha',
      radiosComBrUrl: '',
      about: 'https://www.gruporbs.com.br/nossas-marcas/6/gaucha',
      checkedAt,
    },
  },
  2: {
    slogan: 'Fechada com você. Fechada com a verdade.',
    website: 'https://www.band.com.br/radio-bandeirantes',
    about:
      'Emissora do Grupo Bandeirantes com jornalismo, opinião, esporte e prestação de serviço.',
    sources: {
      slogan: 'https://www.band.com.br/',
      website: 'https://www.band.com.br/radio-bandeirantes',
      radiosComBrUrl: '',
      about: 'https://www.band.com.br/',
      checkedAt,
    },
  },
  3: {
    slogan: 'A Tupi é o povo no ar!',
    website: 'https://www.tupi.fm/',
    about:
      'Emissora carioca tradicional, com jornalismo popular, entretenimento, serviço e esporte.',
    sources: {
      slogan: 'https://www.tupi.fm/quem-somos/',
      website: 'https://www.tupi.fm/quem-somos/',
      radiosComBrUrl: '',
      about: 'https://www.tupi.fm/quem-somos/',
      checkedAt,
    },
  },
  4: {
    slogan: 'Sotaque mineiro que fala com o Brasil inteiro',
    website: 'https://www.itatiaia.com.br/',
    about:
      'Grupo de mídia mineiro com jornalismo, política, esporte, serviço e entretenimento.',
    sources: {
      slogan: 'https://www.itatiaia.com.br/quem-somos/',
      website: 'https://www.itatiaia.com.br/quem-somos/',
      radiosComBrUrl: '',
      about: 'https://www.itatiaia.com.br/quem-somos/',
      checkedAt,
    },
  },
  5: {
    slogan: 'A rádio que virou TV',
    website: 'https://jovempan.com.br/jpnews',
    about:
      'Canal de notícias 24 horas do Grupo Jovem Pan, com informação, opinião, esporte e entretenimento.',
    sources: {
      slogan: 'https://jovempan.com.br/jpnews',
      website: 'https://jovempan.com.br/jpnews',
      radiosComBrUrl: '',
      about: 'https://jovempan.com.br/sobre-a-jovem-pan/',
      checkedAt,
    },
  },
  6: {
    slogan: 'A rádio que toca notícia',
    website: 'https://cbn.globoradio.globo.com/',
    about:
      'Rede jornalística com notícias, análise, prestação de serviço e informação em tempo real.',
    sources: {
      slogan: 'https://cbn.globoradio.globo.com/',
      website: 'https://cbn.globoradio.globo.com/',
      radiosComBrUrl: '',
      about: 'https://cbn.globoradio.globo.com/',
      checkedAt,
    },
  },
  7: {
    slogan: 'Em um segundo, tudo pode mudar',
    website: 'https://www.band.com.br/bandnews-fm',
    about:
      'Rede de notícias multiplataforma com jornalismo 24 horas, participação e prestação de serviço.',
    sources: {
      slogan:
        'https://www.band.com.br/nacional/brasil/bandnews-fm-lanca-campanha-que-valoriza-presenca-dos-ouvintes-16324020',
      website: 'https://www.band.com.br/nacional/brasil/sobre',
      radiosComBrUrl: '',
      about: 'https://www.band.com.br/nacional/brasil/sobre',
      checkedAt,
    },
  },
  8: {
    slogan: 'A tua voz',
    website: 'https://gauchazh.clicrbs.com.br/',
    about:
      'Emissora gaúcha de jornalismo e esporte, com cobertura local, nacional e internacional.',
    sources: {
      slogan: 'https://gauchazh.clicrbs.com.br/',
      website: 'https://www.gruporbs.com.br/nossas-marcas/6/gaucha',
      radiosComBrUrl: '',
      about: 'https://www.gruporbs.com.br/nossas-marcas/6/gaucha',
      checkedAt,
    },
  },
  9: {
    slogan: 'A número 1 em música',
    website: 'https://www.antena1.com.br/',
    about:
      'Rádio musical com sucessos internacionais, clássicos e lançamentos selecionados.',
    sources: {
      slogan: 'https://www.antena1.com.br/',
      website: 'https://www.antena1.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.antena1.com.br/',
      checkedAt,
    },
  },
  10: {
    slogan: 'A rádio que mora no coração',
    website: 'https://saudadefm.com.br/',
    about:
      'Rádio de Santos dedicada a sucessos e memórias musicais que atravessam gerações.',
    sources: {
      slogan: 'https://saudadefm.com.br/',
      website: 'https://saudadefm.com.br/',
      radiosComBrUrl: '',
      about: 'https://saudadefm.com.br/',
      checkedAt,
    },
  },
  11: {
    slogan: 'A rádio que fala com você',
    website: 'https://www.band.com.br/',
    about:
      'Emissora paulista do Grupo Bandeirantes com informação, esporte e opinião.',
    sources: {
      slogan: 'https://www.band.com.br/',
      website: 'https://www.band.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.band.com.br/',
      checkedAt,
    },
  },
  12: {
    slogan: 'A rádio que toca você',
    website: 'https://www.band.com.br/radios/nativa/sao-paulo',
    about:
      'Rádio popular brasileira com música, entretenimento e conexão com o ouvinte.',
    sources: {
      slogan: 'https://www.band.com.br/radios/nativa/sao-paulo',
      website: 'https://www.band.com.br/radios/nativa/sao-paulo',
      radiosComBrUrl: '',
      about: 'https://www.band.com.br/radios/nativa/sao-paulo',
      checkedAt,
    },
  },
  13: {
    slogan: 'A trilha sonora da sua vida',
    website: 'https://jb.fm/',
    about:
      'Rádio carioca de música adulta contemporânea, informação e cultura.',
    sources: {
      slogan: 'https://jb.fm/',
      website: 'https://jb.fm/',
      radiosComBrUrl: '',
      about: 'https://jb.fm/',
      checkedAt,
    },
  },
  14: {
    slogan: 'A rádio adulta contemporânea',
    website: 'https://alphafm.com.br/',
    about:
      'Rádio musical de São Paulo com pop, clássicos e programação adulta contemporânea.',
    sources: {
      slogan: 'https://alphafm.com.br/',
      website: 'https://alphafm.com.br/',
      radiosComBrUrl: '',
      about: 'https://alphafm.com.br/',
      checkedAt,
    },
  },
  15: {
    slogan: 'A rádio que toca de tudo',
    website: 'https://tmc.com.br/',
    about:
      'Emissora paulistana com programação musical variada e transmissão online.',
    sources: {
      slogan: 'https://tmc.com.br/',
      website: 'https://tmc.com.br/',
      radiosComBrUrl: '',
      about: 'https://tmc.com.br/o-que-e-a-tmc/',
      checkedAt,
    },
  },
  16: {
    slogan: 'A rádio rock',
    website: 'https://www.89fm.com.br/',
    about:
      'Rádio rock de São Paulo com clássicos, novidades e cultura do gênero.',
    sources: {
      slogan: 'https://www.89fm.com.br/',
      website: 'https://www.89fm.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.89fm.com.br/',
      checkedAt,
    },
  },
  17: {
    slogan: 'Pernambuco em primeiro lugar',
    website: 'https://radiojornal.com.br/',
    about:
      'Rádio pernambucana com jornalismo, prestação de serviço, esporte e informação local.',
    sources: {
      slogan: 'https://radiojornal.com.br/',
      website: 'https://radiojornal.com.br/',
      radiosComBrUrl: '',
      about: 'https://radiojornal.com.br/',
      checkedAt,
    },
  },
  18: {
    slogan: 'A rádio do amor',
    website: 'https://melodiaweb.com.br/',
    about:
      'Rádio carioca de música gospel, mensagens de fé e programação voltada à família.',
    sources: {
      slogan: 'https://melodiaweb.com.br/',
      website: 'https://melodiaweb.com.br/',
      radiosComBrUrl: '',
      about: 'https://melodiaweb.com.br/',
      checkedAt,
    },
  },
  19: {
    slogan: 'Aparecida, a rádio que acolhe',
    website: 'https://www.a12.com/radio',
    about:
      'Rádio da Rede Aparecida com fé, informação, música e conteúdos para toda a família.',
    sources: {
      slogan: 'https://www.a12.com/radio',
      website: 'https://www.a12.com/radio',
      radiosComBrUrl: '',
      about: 'https://www.a12.com/radio',
      checkedAt,
    },
  },
  20: {
    slogan: 'Alegria que irradia',
    website: 'https://www.fmodia.com.br/',
    about:
      'Rádio carioca popular com música, humor, entretenimento e conexão com o público.',
    sources: {
      slogan: 'https://www.fmodia.com.br/',
      website: 'https://www.fmodia.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.fmodia.com.br/',
      checkedAt,
    },
  },
  21: {
    slogan: 'A rádio que é a cara de Brasília',
    website: 'https://clube105.com.br/',
    about:
      'Rádio de Brasília com música popular, entretenimento e programação local.',
    sources: {
      slogan: 'https://clube105.com.br/',
      website: 'https://clube105.com.br/',
      radiosComBrUrl: '',
      about: 'https://clube105.com.br/',
      checkedAt,
    },
  },
  22: {
    slogan: 'A rádio que é tudo de bom',
    website: 'https://radiomixfm.com.br/',
    about:
      'Rádio musical com hits, entretenimento e uma programação conectada ao público jovem.',
    sources: {
      slogan: 'https://radiomixfm.com.br/',
      website: 'https://radiomixfm.com.br/',
      radiosComBrUrl: '',
      about: 'https://radiomixfm.com.br/',
      checkedAt,
    },
  },
  23: {
    slogan: 'A rádio do Ceará',
    website: 'https://jangadeiroonline.com.br/',
    about:
      'Emissora de Fortaleza com informação, música, esporte e conteúdo regional.',
    sources: {
      slogan: 'https://jangadeiroonline.com.br/',
      website: 'https://jangadeiroonline.com.br/',
      radiosComBrUrl: '',
      about: 'https://jangadeiroonline.com.br/',
      checkedAt,
    },
  },
  24: {
    slogan: 'A rádio que é a cara de Minas',
    website: 'https://www.radioliberdade.com.br/',
    about:
      'Rádio de Belo Horizonte com música, jornalismo, informação e programação popular.',
    sources: {
      slogan: 'https://www.radioliberdade.com.br/',
      website: 'https://www.radioliberdade.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.radioliberdade.com.br/',
      checkedAt,
    },
  },
  25: {
    slogan: 'A música que toca o coração',
    website: 'https://jovempan.com.br/',
    about:
      'Rede Jovem Pan com música, informação, opinião e presença multiplataforma.',
    sources: {
      slogan: 'https://jovempan.com.br/',
      website: 'https://jovempan.com.br/',
      radiosComBrUrl: '',
      about: 'https://jovempan.com.br/sobre-a-jovem-pan/',
      checkedAt,
    },
  },
}

const positionOverrides: Record<
  number,
  Omit<Top25Enrichment, 'radiosComBrUrl'>
> = {
  8: {
    slogan: 'A rádio do futebol gaúcho',
    website: 'https://www.radiogrenal.com.br/',
    about:
      'Emissora de Porto Alegre dedicada ao futebol gaúcho, ao esporte e à opinião.',
    sources: {
      slogan: 'https://www.radiogrenal.com.br/',
      website: 'https://www.radiogrenal.com.br/',
      radiosComBrUrl: '',
      about: 'https://www.radiogrenal.com.br/',
      checkedAt,
    },
  },
  15: {
    slogan: 'A rádio que é show',
    website: 'https://metropolitana.com.br/',
    about:
      'Rádio jovem de São Paulo com música, entretenimento e interação com o público.',
    sources: {
      slogan: 'https://metropolitana.com.br/',
      website: 'https://metropolitana.com.br/',
      radiosComBrUrl: '',
      about: 'https://metropolitana.com.br/',
      checkedAt,
    },
  },
  16: editorial[15],
  17: editorial[16],
  18: editorial[17],
  19: editorial[18],
  20: editorial[19],
  21: editorial[20],
  22: editorial[21],
  23: editorial[22],
  24: editorial[23],
  25: editorial[24],
}

export const top25Enrichment: Record<number, Top25Enrichment> =
  Object.fromEntries(
    top25Ranking.map((ranking) => {
      const entry =
        positionOverrides[ranking.position] ?? editorial[ranking.position]
      return [
        ranking.position,
        {
          ...entry,
          radiosComBrUrl: ranking.radiosComBrUrl,
          sources: {
            ...entry.sources,
            radiosComBrUrl: ranking.radiosComBrUrl,
          },
        },
      ]
    }),
  ) as Record<number, Top25Enrichment>

export function getTop25Enrichment(
  position: number,
): Top25Enrichment | undefined {
  return top25Enrichment[position]
}
