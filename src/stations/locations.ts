export const regionDefinitions = [
  {
    id: 'norte',
    name: 'Norte',
    states: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  },
  {
    id: 'nordeste',
    name: 'Nordeste',
    states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  },
  {
    id: 'centro-oeste',
    name: 'Centro-Oeste',
    states: ['DF', 'GO', 'MT', 'MS'],
  },
  { id: 'sudeste', name: 'Sudeste', states: ['ES', 'MG', 'RJ', 'SP'] },
  { id: 'sul', name: 'Sul', states: ['PR', 'RS', 'SC'] },
] as const

export const stateDefinitions = [
  ['AC', 'Acre', 'norte'],
  ['AL', 'Alagoas', 'nordeste'],
  ['AP', 'Amapá', 'norte'],
  ['AM', 'Amazonas', 'norte'],
  ['BA', 'Bahia', 'nordeste'],
  ['CE', 'Ceará', 'nordeste'],
  ['DF', 'Distrito Federal', 'centro-oeste'],
  ['ES', 'Espírito Santo', 'sudeste'],
  ['GO', 'Goiás', 'centro-oeste'],
  ['MA', 'Maranhão', 'nordeste'],
  ['MT', 'Mato Grosso', 'centro-oeste'],
  ['MS', 'Mato Grosso do Sul', 'centro-oeste'],
  ['MG', 'Minas Gerais', 'sudeste'],
  ['PA', 'Pará', 'norte'],
  ['PB', 'Paraíba', 'nordeste'],
  ['PR', 'Paraná', 'sul'],
  ['PE', 'Pernambuco', 'nordeste'],
  ['PI', 'Piauí', 'nordeste'],
  ['RJ', 'Rio de Janeiro', 'sudeste'],
  ['RN', 'Rio Grande do Norte', 'nordeste'],
  ['RS', 'Rio Grande do Sul', 'sul'],
  ['RO', 'Rondônia', 'norte'],
  ['RR', 'Roraima', 'norte'],
  ['SC', 'Santa Catarina', 'sul'],
  ['SP', 'São Paulo', 'sudeste'],
  ['SE', 'Sergipe', 'nordeste'],
  ['TO', 'Tocantins', 'norte'],
] as const

export type StateId = (typeof stateDefinitions)[number][0]
export type RegionId = (typeof regionDefinitions)[number]['id']
export const BRAZILIAN_STATES = stateDefinitions.map(([id, name, region]) => ({
  id,
  name,
  region,
}))
export const BRAZILIAN_REGIONS = regionDefinitions.map(({ id, name }) => ({
  id,
  name,
}))

const fold = (value: string) =>
  value.normalize('NFKD').replace(/\p{M}/gu, '').trim().toLowerCase()
const stateLookup = new Map<string, StateId>()
for (const [id, name] of stateDefinitions) {
  stateLookup.set(id.toLowerCase(), id)
  stateLookup.set(fold(name), id)
}
stateLookup.set('brasilia', 'DF')

export function normalizeBrazilianState(value?: string): StateId | undefined {
  return value ? stateLookup.get(fold(value)) : undefined
}

export function statesForRegion(region: RegionId): StateId[] {
  return (
    regionDefinitions.find((item) => item.id === region)?.states.slice() ?? []
  )
}
