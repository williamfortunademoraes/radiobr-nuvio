import { normalizeState, type StateCode } from '../stations/states.js'
import type { Station } from '../stations/types.js'

export const REGIONS = [
  { id: 'norte', name: 'Norte' },
  { id: 'nordeste', name: 'Nordeste' },
  { id: 'centro-oeste', name: 'Centro-Oeste' },
  { id: 'sudeste', name: 'Sudeste' },
  { id: 'sul', name: 'Sul' },
] as const

export type RegionId = (typeof REGIONS)[number]['id']

const STATE_ROWS = [
  ['AC', 'Acre', '12', 'norte'],
  ['AL', 'Alagoas', '27', 'nordeste'],
  ['AP', 'Amapá', '16', 'norte'],
  ['AM', 'Amazonas', '13', 'norte'],
  ['BA', 'Bahia', '29', 'nordeste'],
  ['CE', 'Ceará', '23', 'nordeste'],
  ['DF', 'Distrito Federal', '53', 'centro-oeste'],
  ['ES', 'Espírito Santo', '32', 'sudeste'],
  ['GO', 'Goiás', '52', 'centro-oeste'],
  ['MA', 'Maranhão', '21', 'nordeste'],
  ['MT', 'Mato Grosso', '51', 'centro-oeste'],
  ['MS', 'Mato Grosso do Sul', '50', 'centro-oeste'],
  ['MG', 'Minas Gerais', '31', 'sudeste'],
  ['PA', 'Pará', '15', 'norte'],
  ['PB', 'Paraíba', '25', 'nordeste'],
  ['PR', 'Paraná', '41', 'sul'],
  ['PE', 'Pernambuco', '26', 'nordeste'],
  ['PI', 'Piauí', '22', 'nordeste'],
  ['RJ', 'Rio de Janeiro', '33', 'sudeste'],
  ['RN', 'Rio Grande do Norte', '24', 'nordeste'],
  ['RS', 'Rio Grande do Sul', '43', 'sul'],
  ['RO', 'Rondônia', '11', 'norte'],
  ['RR', 'Roraima', '14', 'norte'],
  ['SC', 'Santa Catarina', '42', 'sul'],
  ['SP', 'São Paulo', '35', 'sudeste'],
  ['SE', 'Sergipe', '28', 'nordeste'],
  ['TO', 'Tocantins', '17', 'norte'],
] as const

export type GeographyState = {
  code: StateCode
  name: string
  ibgeCode: string
  region: RegionId
}

export const STATE_GEOGRAPHY: readonly GeographyState[] = STATE_ROWS.map(
  ([code, name, ibgeCode, region]) => ({
    code: code as StateCode,
    name,
    ibgeCode,
    region: region as RegionId,
  }),
)

export const STATES = STATE_GEOGRAPHY

export function regionForState(code: string): RegionId | undefined {
  return STATE_GEOGRAPHY.find((state) => state.code === code.toUpperCase())
    ?.region
}

export function statesForRegion(region: RegionId): GeographyState[] {
  return STATE_GEOGRAPHY.filter((state) => state.region === region)
}

export function stationRegion(
  station: Pick<Station, 'state'>,
): RegionId | undefined {
  const code = normalizeState(station.state)
  return code ? regionForState(code) : undefined
}
