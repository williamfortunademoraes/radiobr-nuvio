export interface AppConfig {
  radioBrowserBaseUrl: string
  userAgent: string
  cacheTtlMs: number
  port: number
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    radioBrowserBaseUrl:
      env.RADIO_BROWSER_BASE_URL ?? 'https://de1.api.radio-browser.info',
    userAgent: env.RADIO_BROWSER_USER_AGENT ?? 'RADIO-BR/0.1.0',
    cacheTtlMs: Number(env.RADIO_BROWSER_CACHE_TTL_MS ?? 300_000),
    port: Number(env.PORT ?? 7000),
  }
}
