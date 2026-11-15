import { expect, test } from '@playwright/test'

const fixture: any = {
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

fixture.genres[0].stations = [fixture.featured[0]]
fixture.regions[0].stations = [fixture.featured[0]]

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
          urlResolved: 'https://stream.example/horizonte.mp3',
        },
      ],
    }),
  )
  await page.goto('/')
  const addonBox = await page.locator('.portal-addon').boundingBox()
  const footerBox = await page.locator('.site-footer').boundingBox()
  expect(addonBox).not.toBeNull()
  expect(footerBox).not.toBeNull()
  expect(footerBox!.y - (addonBox!.y + addonBox!.height)).toBeLessThan(80)
  await expect(page.locator('#featured-stations .radio-card')).toHaveCount(2)
  expect(
    await page
      .locator('#featured-stations .radio-card-play')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor),
  ).toBe('rgb(30, 215, 96)')
  await expect(
    page.locator('#featured-stations .radio-card').nth(1).locator('.radio-card-art img'),
  ).toHaveAttribute('src', /^data:image\/svg\+xml/)
  await expect(
    page.locator('#genre-sections .portal-subsection-content').first(),
  ).toBeHidden()
  await page.locator('#genre-sections .portal-section-toggle').first().click()
  await expect(
    page.locator('#genre-sections .portal-subsection-content').first(),
  ).toBeVisible()
  await page.locator('#station-search').fill('Horizonte')
  await page.getByRole('button', { name: 'Buscar' }).click()
  await expect(page.locator('#station-results .radio-card')).toHaveCount(1)
  await page
    .locator('#featured-stations .radio-card')
    .first()
    .getByRole('button', { name: /ouvir/i })
    .click()
  await expect(page.locator('#global-player')).toBeVisible()
  const playerBox = await page.locator('#global-player').boundingBox()
  const viewport = page.viewportSize()
  expect(playerBox).not.toBeNull()
  expect(playerBox!.x).toBe(0)
  expect(playerBox!.y + playerBox!.height).toBe(viewport!.height)
  const closeBox = await page.locator('#global-player-close').boundingBox()
  const favoriteBox = await page.locator('#global-player-favorite').boundingBox()
  expect(closeBox).not.toBeNull()
  expect(favoriteBox).not.toBeNull()
  expect(closeBox!.y).toBeLessThan(playerBox!.y + playerBox!.height / 2)
  expect(favoriteBox!.y).toBeLessThan(playerBox!.y + playerBox!.height / 2)
  await expect(page.locator('#global-player-name')).toHaveText(
    'Rádio Horizonte',
  )
  await expect(page.locator('#global-play-toggle')).toBeVisible()
  await expect(page.locator('.player-wave')).toBeVisible()
  await page.locator('#global-player-minimize').click()
  await expect(page.locator('#global-player')).toHaveClass(/is-minimized/)
  await expect(page.locator('#global-audio')).toBeHidden()
  await page.getByRole('button', { name: 'Restaurar player' }).click()
  await expect(page.locator('#global-player')).not.toHaveClass(/is-minimized/)
  await expect(page.locator('#global-audio')).toBeVisible()
  await expect(page.locator('#global-audio')).toHaveAttribute(
    'src',
    fixture.featured[0].urlResolved,
  )
  await page.locator('#global-player-favorite').click()
  await expect(page.locator('#global-player-favorite')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.reload()
  await expect(page.locator('#favoritos')).toBeVisible()
  await expect(page.locator('#global-player')).toBeVisible()
  await expect(page.locator('#global-player-name')).toHaveText(
    'Rádio Horizonte',
  )
  await page.locator('#global-volume').fill('0.35')
  await expect(page.locator('#global-audio')).toHaveJSProperty('volume', 0.35)
  await expect(page.locator('audio')).toHaveCount(1)
  await page
    .locator('#featured-stations .radio-card')
    .nth(1)
    .getByRole('button', { name: /ouvir/i })
    .click()
  await expect(page.locator('#global-player-name')).toHaveText('Rádio Sertão')
  await expect(page.locator('#global-audio')).toHaveAttribute(
    'src',
    fixture.featured[1].urlResolved,
  )
})

test('keeps the player inside the viewport on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.route('**/api/home', (route) => route.fulfill({ json: fixture }))
  await page.goto('/')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await expect(page.locator('#global-player')).toBeHidden()
})
