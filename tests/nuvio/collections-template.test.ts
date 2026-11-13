import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const templatePath = fileURLToPath(
  new URL('../../assets/nuvio-collections.json', import.meta.url),
)

describe('Nuvio collection template', () => {
  it('groups genre and region sources under their collection titles', async () => {
    const collections = JSON.parse(await readFile(templatePath, 'utf8')) as {
      title: string
      folders: { title: string; catalogSources: { catalogId: string }[] }[]
    }[]

    expect(collections.map((collection) => collection.title)).toEqual([
      'Gêneros Musicais',
      'Por Regiões',
    ])
    expect(collections[0].folders.map((folder) => folder.title)).toEqual([
      'Notícias e esportes',
      'Sertanejo',
      'Samba e pagode',
      'Rock',
      'Gospel',
      'Pop',
      'MPB',
      'Música eletrônica',
      'Outros gêneros',
    ])
    expect(collections[1].folders.map((folder) => folder.title)).toEqual([
      'Norte',
      'Nordeste',
      'Centro-Oeste',
      'Sudeste',
      'Sul',
    ])
    expect(
      collections
        .flatMap((collection) => collection.folders)
        .every(
          (folder) =>
            folder.catalogSources.length === 1 &&
            /^(radio-br-genre|radio-br-region)-/.test(
              folder.catalogSources[0].catalogId,
            ),
        ),
    ).toBe(true)
  })
})
