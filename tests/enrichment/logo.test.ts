import { describe, expect, it } from 'vitest'
import { chooseLogo, validateLogo } from '../../src/enrichment/logo.js'

function png(width: number, height: number): ArrayBuffer {
  const bytes = new Uint8Array(24)
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10])
  new DataView(bytes.buffer).setUint32(16, width)
  new DataView(bytes.buffer).setUint32(20, height)
  return bytes.buffer as ArrayBuffer
}

describe('logo validation', () => {
  it('accepts a real PNG above the minimum dimensions', async () => {
    const result = await validateLogo(
      new Response(png(256, 256), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
      'https://official.example/logo.png',
      'official-website',
      '2026-11-12T00:00:00.000Z',
    )

    expect(result).toMatchObject({
      url: 'https://official.example/logo.png',
      width: 256,
      height: 256,
      source: 'official-website',
    })
  })

  it('rejects HTML and undersized images', async () => {
    await expect(
      validateLogo(
        new Response('<html>blocked</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
        'https://bad.example/logo',
        'public',
        '2026-11-12T00:00:00.000Z',
      ),
    ).resolves.toBeUndefined()
    await expect(
      validateLogo(
        new Response(png(32, 32), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
        'https://bad.example/tiny.png',
        'public',
        '2026-11-12T00:00:00.000Z',
      ),
    ).resolves.toBeUndefined()
  })

  it('keeps an existing higher-priority logo over an inferior candidate', () => {
    expect(
      chooseLogo(
        {
          url: 'https://official.example/current.png',
          source: 'official-website',
          width: 512,
          height: 512,
        },
        [
          {
            url: 'https://public.example/old.png',
            source: 'public',
            width: 1024,
            height: 1024,
          },
        ],
      )?.url,
    ).toBe('https://official.example/current.png')
  })
})
