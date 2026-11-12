import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  outputDir: 'output/playwright/tests',
  use: {
    baseURL: 'http://127.0.0.1:7011',
    browserName: 'chromium',
    channel: 'chrome',
  },
  webServer: {
    command: 'node dist/src/index.js',
    url: 'http://127.0.0.1:7011',
    env: { PORT: '7011', ADDON_BASE_URL: 'http://127.0.0.1:7011' },
    reuseExistingServer: false,
  },
})
