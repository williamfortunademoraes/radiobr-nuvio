/**
 * Brazilian state data used by the optional location filter.
 *
 * Radio Browser stores `state` as free text, so the values are normalized
 * defensively. We only map a value to a state when it is either a UF, a full
 * state name, or a composite string whose state part is explicit (for example
 * "Fortaleza, Ceará"). A bare city name is deliberately left unmapped: the
 * product does not infer locations from station names, domains or phone
 * numbers, and city-level data is not reliable enough to expose yet.
 */
export const STATES = [
  { code: 'AC', name: 'Acre', region: 'Norte' },
  { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { code: 'AP', name: 'Amapá', region: 'Norte' },
  { code: 'AM', name: 'Amazonas', region: 'Norte' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
  { code: 'CE', name: 'Ceará', region: 'Nordeste' },
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'PA', name: 'Pará', region: 'Norte' },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { code: 'PR', name: 'Paraná', region: 'Sul' },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI', name: 'Piauí', region: 'Nordeste' },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'RO', name: 'Rondônia', region: 'Norte' },
  { code: 'RR', name: 'Roraima', region: 'Norte' },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
  { code: 'TO', name: 'Tocantins', region: 'Norte' },
] as const

export type StateCode = (typeof STATES)[number]['code']
export type StateRegion = (typeof STATES)[number]['region']

export const STATE_CODES = STATES.map((state) => state.code) as StateCode[]
export const STATE_REGIONS = [
  'Norte',
  'Nordeste',
  'Centro-Oeste',
  'Sudeste',
  'Sul',
] as const

const COMBINING_MARKS = /\p{M}/gu
const stateLookup = new Map<string, StateCode>()

function normalizeStateText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bstate of\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function addStateAlias(alias: string, code: StateCode): void {
  const normalized = normalizeStateText(alias)
  if (normalized) stateLookup.set(normalized, code)
}

for (const state of STATES) {
  addStateAlias(state.code, state.code)
  addStateAlias(state.name, state.code)
}

// A few unambiguous English variants that appear in the upstream data.
addStateAlias('Federal District', 'DF')
addStateAlias('State of São Paulo', 'SP')
addStateAlias('State of Rio de Janeiro', 'RJ')
addStateAlias('State of Minas Gerais', 'MG')

function lookupState(value: string): StateCode | undefined {
  return stateLookup.get(normalizeStateText(value))
}

/**
 * Resolves a Radio Browser `state` value to a UF.
 *
 * The function accepts codes ("SP"), names ("São Paulo"), accentless names
 * ("Sao Paulo"), values with parenthetical suffixes ("São Paulo (BR)") and
 * composites with an explicit state part ("Fortaleza, Ceará"). It returns
 * `undefined` for empty, ambiguous or city-only values.
 */
export function normalizeState(value?: string): StateCode | undefined {
  if (!value?.trim()) return undefined

  const direct = lookupState(value)
  if (direct) return direct

  // "Fortaleza, Ceará", "Rio de Janeiro - RJ", "São Paulo / SP".
  const parts = value.split(/[,;|/]|\s+[-–—]\s+/)
  for (const part of parts) {
    const code = lookupState(part)
    if (code) return code
  }

  return undefined
}

export function stateName(code: StateCode): string {
  return STATES.find((state) => state.code === code)!.name
}
