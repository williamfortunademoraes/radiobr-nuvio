import { expect, test } from '@playwright/test'

const fixture = {
  featured: [
    {
      id: 'radio-br:one',
      stationUuid: 'one',
      name: 'Rádio Horizonte',
      favicon: 'https://example.com/horizonte.png',
      state: 'SP',
      stateName: 'São Paulo',
      codec: 'MP3',
      bitrate: 128,
      urlResolved: 'https://stream.example/horizonte.mp3',
      tags: ['pop'],
    },
    {
      id: 'radio-br:two',
      stationUuid: 'two',
      name: 'Rádio Sertão',
      state: 'CE',
      stateName: 'Ceará',
      urlResolved: 'https://stream.example/sertao.mp3',
      tags: ['sertanejo'],
    },
  ],
  genres: [
    {
      id: 'pop',
      title: 'Pop',
      kind: 'genre',
      stations: [],
    },
    {
      id: 'sertanejo',
      title: 'Sertanejo',
      kind: 'genre',
      stations: [],
    },
  ],
  regions: [
    { id: 'sudeste', title: 'Sudeste', kind: 'region', stations: [] },
    { id: 'nordeste', title: 'Nordeste', kind: 'region', stations: [] },
  ],
  availableGenres: [
    { id: 'pop', name: 'Pop' },
    { id: 'sertanejo', name: 'Sertanejo' },
  ],
}

test('searches, starts, switches and favorites a radio in the global player', async ({
  page,
}) => {
  await page.route('**/api/home', (route) => route.fulfill({ json: fixture }))
  await page.route('**/api/stations**', (route) =>
    route.fulfill({
      json: [
        {
          id: 'radio-br:one',
          name: 'Rádio Horizonte',
          favicon: '',
          state: 'SP',
          codec: 'MP3',
          bitrate: 128,
        },
      ],
    }),
  )
  await page.goto('/')
  await expect(page.locator('#featured-stations .radio-card')).toHaveCount(2)
  await page.locator('#featured-stations .radio-card').first().getByRole('button', { name: /ouvir/i }).click()
  await expect(page.locator('#global-player')).toBeVisible()
  await expect(page.locator('#global-player-name')).toHaveText('Rádio Horizonte')
  await expect(page.locator('#global-audio')).toHaveAttribute('src', fixture.featured[0].urlResolved)
  await page.locator('#global-player-favorite').click()
  await expect(page.locator('#global-player-favorite')).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await expect(page.locator('#favoritos')).toBeVisible()
  await page.locator('#featured-stations .radio-card').nth(1).getByRole('button', { name: /ouvir/i }).click()
  await expect(page.locator('#global-player-name')).toHaveText('Rádio Sertão')
  await expect(page.locator('#global-audio')).toHaveAttribute('src', fixture.featured[1].urlResolved)
})

test('keeps the player inside the viewport on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/api/home', (route) => route.fulfill({ json: fixture }))
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(page.locator('#global-player')).toBeHidden()
})
