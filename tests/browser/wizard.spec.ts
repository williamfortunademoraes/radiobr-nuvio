import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`wizard generates persistent multiple selections at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Suas rádios.',
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page
      .getByRole('link', { name: 'Personalizar minhas rádios' })
      .first()
      .click()
    await page
      .locator('input[name="collections"][value="editorial"]')
      .locator('..')
      .click()
    await page
      .locator('input[name="collections"][value="all"]')
      .locator('..')
      .click()
    await page.locator('[data-step-target="2"]').click()
    await page
      .locator('input[name="genres"][value="sertanejo"]')
      .locator('..')
      .click()
    await page
      .locator('input[name="genres"][value="gospel"]')
      .locator('..')
      .click()
    await page.locator('[data-step-target="3"]').click()
    await page.locator('#all-states').locator('..').click()
    await page.locator('input[name="states"][value="RJ"]').locator('..').click()
    await page.locator('input[name="states"][value="SP"]').locator('..').click()
    await page.locator('[data-step-target="4"]').click()
    await page.locator('#show-logos').locator('..').click()
    await page.locator('[data-step-target="5"]').first().click()
    await expect(page.locator('#review-genres')).toContainText('Gospel')
    await expect(page.locator('#review-states')).toContainText('São Paulo')
    await page.locator('#generate-addon').click()
    await expect(page.locator('#result')).toBeVisible()
    const url = await page.locator('#result-url').inputValue()
    const response = await page.request.get(url)
    expect(response.status()).toBe(200)
    const manifest = await response.json()
    expect(manifest.catalogs.map((c: { id: string }) => c.id)).toEqual([
      'radio-br-genre-sertanejo',
      'radio-br-genre-gospel',
      'radio-br-state-rj',
      'radio-br-state-sp',
      'radio-br-catalog',
    ])
    expect(
      JSON.parse(await page.locator('#manifest-json').innerText()),
    ).toEqual(manifest)
    expect(await (await page.request.get(url)).json()).toEqual(manifest)
    expect(await page.locator('#install-stremio').getAttribute('href')).toBe(
      url.replace('http://', 'stremio://'),
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `output/playwright/wizard-${width}.png`,
      fullPage: true,
    })
    expect(errors).toEqual([])
  })
}

test('empty selection is rejected and stale installation is hidden after editing', async ({
  page,
}) => {
  await page.goto('/personalizar')
  await page.locator('[data-step-target="5"]').first().click()
  await page.locator('#generate-addon').click()
  await expect(page.locator('#result')).toBeVisible()
  await page.locator('[data-step-target="1"]').click()
  for (const id of ['editorial', 'all'])
    await page
      .locator(`input[name="collections"][value="${id}"]`)
      .locator('..')
      .click()
  await expect(page.locator('#result')).toBeHidden()
  await page.locator('[data-step-target="5"]').first().click()
  await page.locator('#generate-addon').click()
  await expect(page.locator('#step-error')).toContainText(
    'Selecione pelo menos uma coleção',
  )
})
