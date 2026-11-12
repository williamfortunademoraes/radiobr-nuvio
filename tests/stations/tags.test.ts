import { describe, expect, it } from 'vitest'
import {
  classifyStationTags,
  classifyTags,
  GENRE_NAMES,
  genreName,
  normalizeTags,
  resolveGenre,
} from '../../src/stations/tags.js'

describe('tag normalization', () => {
  it('splits commas, trims, lowercases, removes accents and separators', () => {
    expect(
      normalizeTags(
        ' Sertanejo,  SERTANEJO , Música  Gospel ,música gospel , rock-n-roll ',
      ),
    ).toEqual(['sertanejo', 'musica gospel', 'rock n roll'])
  })

  it('normalizes accents for comparison', () => {
    expect(normalizeTags(['Eletrônica', 'MPB', 'Cristã'])).toEqual([
      'eletronica',
      'mpb',
      'crista',
    ])
  })

  it('standardizes separators', () => {
    expect(normalizeTags(['pop_music', 'top/40', 'r&b'])).toEqual([
      'pop music',
      'top 40',
      'r e b',
    ])
  })

  it('removes duplicates and empty tags', () => {
    expect(normalizeTags('samba, Samba, SAMBA, ,  ')).toEqual(['samba'])
    expect(normalizeTags(' , ')).toEqual([])
  })

  it('splits comma-separated items inside arrays', () => {
    expect(normalizeTags(['samba, pagode'])).toEqual(['samba', 'pagode'])
  })

  it('does not mutate or replace the original tag values', () => {
    const original = 'Sertanejo, Música Gospel'
    expect(normalizeTags(original)).toEqual(['sertanejo', 'musica gospel'])
    expect(original).toBe('Sertanejo, Música Gospel')
  })
})

describe('tag classification', () => {
  it.each([
    ['sertanejo', 'sertanejo'],
    ['sertanejo universitário', 'sertanejo'],
    ['pagode brasileiro', 'pagode'],
    ['samba brasileiro', 'samba'],
    ['classic rock', 'rock'],
    ['rock nacional', 'rock'],
    ['música gospel', 'gospel'],
    ['christian', 'gospel'],
    ['pop music', 'pop'],
    ['música popular brasileira', 'mpb'],
    ['eletrônica', 'eletronica'],
    ['electronic', 'eletronica'],
    ['dance', 'eletronica'],
    ['notícias', 'noticias'],
    ['news', 'noticias'],
    ['esportes', 'esportes'],
    ['futebol', 'esportes'],
    ['music', 'musica'],
  ])('classifies %s as %s', (tag, genre) => {
    expect(classifyTags(tag)).toEqual([genre])
  })

  it('classifies a station in multiple genres when tags justify it', () => {
    expect(classifyTags('sertanejo, pop, dance')).toEqual([
      'sertanejo',
      'pop',
      'eletronica',
    ])
  })

  it('returns no genre for unknown, generic or absent tags', () => {
    expect(classifyTags('forró')).toEqual([])
    expect(classifyTags('radio, live, brasil, online')).toEqual([])
    expect(classifyTags('')).toEqual([])
    expect(classifyTags([])).toEqual([])
  })

  it('distinguishes identifiable unknown tags from generic tags', () => {
    expect(classifyStationTags('forró')).toEqual({
      genres: [],
      hasIdentifiableTag: true,
    })
    expect(classifyStationTags('radio, live, brasil')).toEqual({
      genres: [],
      hasIdentifiableTag: false,
    })
    expect(classifyStationTags('sertanejo')).toEqual({
      genres: ['sertanejo'],
      hasIdentifiableTag: true,
    })
  })
})

describe('genre catalog metadata', () => {
  it('exposes the thirteen categories in canonical order', () => {
    expect(GENRE_NAMES).toEqual([
      'Notícias',
      'Esportes',
      'Música',
      'Sertanejo',
      'Pagode',
      'Samba',
      'Rock',
      'Gospel',
      'Pop',
      'MPB',
      'Música eletrônica',
      'Outros gêneros identificados',
      'Gênero não informado',
    ])
    expect(genreName('eletronica')).toBe('Música eletrônica')
  })

  it('resolves names and ids without accents or case sensitivity', () => {
    expect(resolveGenre('Sertanejo')).toBe('sertanejo')
    expect(resolveGenre('Música eletrônica')).toBe('eletronica')
    expect(resolveGenre('musica eletronica')).toBe('eletronica')
    expect(resolveGenre('Outros gêneros identificados')).toBe('outros')
    expect(resolveGenre('Gênero não informado')).toBe('nao-informado')
    expect(resolveGenre('nao-informado')).toBe('nao-informado')
    expect(resolveGenre('Inexistente')).toBeUndefined()
  })
})
