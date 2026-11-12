import path from 'node:path'
import { createRequire } from 'node:module'
import type { Server } from 'node:http'
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import { createAddon } from './addon/create-addon.js'
import { createManifest } from './addon/manifest.js'
import { parseConfigSegment } from './config/addon-config.js'
import { loadConfig, type AppConfig } from './config/index.js'
import { RadioBrowserClient } from './radio-browser/client.js'
import { renderConfigPage, renderLandingPage } from './web/pages.js'

const require = createRequire(import.meta.url)
const { getRouter } =
  require('stremio-addon-sdk') as typeof import('stremio-addon-sdk')

export interface CreateAppOptions {
  client?: RadioBrowserClient
  baseUrl?: string
  appConfig?: AppConfig
}

export interface StartServerResult {
  app: Express
  server: Server
  port: number
  baseUrl: string
}

function resolveBaseUrl(appConfig: AppConfig, explicit?: string): string {
  return (
    explicit ??
    process.env.ADDON_BASE_URL ??
    `http://127.0.0.1:${appConfig.port}`
  )
}

function sendPage(res: Response, html: string): void {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.send(html)
}

function sendManifest(res: Response, value: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.send(JSON.stringify(value))
}

export function createApp(options: CreateAppOptions = {}): Express {
  const appConfig = options.appConfig ?? loadConfig()
  const baseUrl = resolveBaseUrl(appConfig, options.baseUrl)
  const client = options.client ?? new RadioBrowserClient(appConfig)
  const addon = createAddon(client, baseUrl)

  const app = express()
  app.disable('x-powered-by')

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'",
    )
    next()
  })

  app.get('/', (_req, res) => sendPage(res, renderLandingPage()))
  app.get('/personalizar', (_req, res) => sendPage(res, renderConfigPage()))
  app.get('/configure', (_req, res) => sendPage(res, renderConfigPage()))
  app.get('/config', (_req, res) => res.redirect(302, '/personalizar'))
  app.get('/sobre', (_req, res) => res.redirect(302, '/#sobre'))

  app.get('/manifest.json', (_req, res) =>
    sendManifest(res, createManifest(baseUrl)),
  )

  app.get('/:config/manifest.json', (req, res) => {
    const result = parseConfigSegment(req.params.config)
    if (!result.ok) {
      res.status(400).json({
        error: 'invalid_config',
        message: result.error,
      })
      return
    }
    sendManifest(res, createManifest(baseUrl, result.config))
  })

  const assetsDir = path.resolve(process.cwd(), 'assets')
  app.use(
    '/assets',
    express.static(assetsDir, {
      maxAge: '1h',
      etag: true,
      fallthrough: true,
    }),
  )

  // The official SDK router handles /catalog, /meta and /stream, including the
  // native /:config/... prefix. The manifest routes above are RADIO BR-owned
  // because they need to build a different manifest for each configuration.
  app.use(getRouter(addon))

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' })
  })

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error(error)
      if (res.headersSent) return
      res.status(500).json({ error: 'internal_error' })
    },
  )

  return app
}

export async function startServer(
  options: CreateAppOptions = {},
): Promise<StartServerResult> {
  const appConfig = options.appConfig ?? loadConfig()
  if (
    !Number.isInteger(appConfig.port) ||
    appConfig.port < 0 ||
    appConfig.port > 65535
  )
    throw new Error('PORT must be a valid TCP port')

  const baseUrl = resolveBaseUrl(appConfig, options.baseUrl)
  const app = createApp({ ...options, appConfig, baseUrl })

  return new Promise<StartServerResult>((resolve, reject) => {
    const server = app.listen(appConfig.port, () => {
      const address = server.address()
      const port =
        typeof address === 'object' && address ? address.port : appConfig.port
      console.log(`RADIO BR disponível em http://0.0.0.0:${port}`)
      console.log(`Manifest padrão: ${baseUrl}/manifest.json`)
      console.log(`Central de personalização: ${baseUrl}/personalizar`)
      resolve({ app, server, port, baseUrl })
    })
    server.once('error', reject)
  })
}
