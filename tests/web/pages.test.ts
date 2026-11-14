import { expect, it } from 'vitest'
import {
  renderLandingPage,
  renderRadioPlayerPage,
} from '../../src/web/pages.js'
import { validStation } from '../fixtures/station.js'
import { normalizeStation } from '../../src/stations/normalize.js'

it('renders the station discovery surface on the landing page', () => {
  const html = renderLandingPage()
  expect(html).toContain('station-search')
  expect(html).toContain('/assets/discover.js')
  expect(html).toContain('global-audio')
  expect(html).toContain('featured-stations')
  expect(html).toContain('genre-sections')
  expect(html).toContain('region-sections')
  expect(html).toContain('/personalizar')
})

it('renders a local favorite action on a station player page', () => {
  const station = normalizeStation(validStation)
  if (!station) throw new Error('fixture should normalize')
  const html = renderRadioPlayerPage(station, 'https://radio.example')
  expect(html).toContain('favorite-station')
  expect(html).toContain('radio-player.js')
})
