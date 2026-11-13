import type { EnrichmentSource } from './types.js'

export interface ValidatedLogo {
  url: string
  source: EnrichmentSource
  width: number
  height: number
}

const priority: Record<EnrichmentSource, number> = {
  user: 5,
  'radios-com-br': 4,
  'official-website': 3,
  'radio-browser': 2,
  public: 1,
}

function dimensions(bytes: Uint8Array, contentType: string) {
  if (contentType.includes('png') && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    if (view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a)
      return { width: view.getUint32(16), height: view.getUint32(20) }
  }
  if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    for (let index = 2; index + 9 < bytes.length; index += 1) {
      if (bytes[index] !== 0xff || bytes[index + 1] < 0xc0) continue
      const marker = bytes[index + 1]
      if ([0xc4, 0xc8, 0xcc].includes(marker)) continue
      const view = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength,
      )
      return {
        width: view.getUint16(index + 7),
        height: view.getUint16(index + 5),
      }
    }
  }
  return undefined
}

export async function validateLogo(
  response: Response,
  url: string,
  source: EnrichmentSource,
  _checkedAt: string,
  minDimension = 96,
): Promise<ValidatedLogo | undefined> {
  if (!response.ok) return undefined
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.startsWith('image/')) return undefined
  const bytes = new Uint8Array(await response.arrayBuffer())
  const size = dimensions(bytes, contentType)
  if (!size || size.width < minDimension || size.height < minDimension)
    return undefined
  return { url, source, ...size }
}

export function chooseLogo(
  existing: ValidatedLogo | undefined,
  candidates: readonly ValidatedLogo[],
): ValidatedLogo | undefined {
  return [existing, ...candidates]
    .filter((logo): logo is ValidatedLogo => Boolean(logo))
    .sort((left, right) => priority[right.source] - priority[left.source])[0]
}
