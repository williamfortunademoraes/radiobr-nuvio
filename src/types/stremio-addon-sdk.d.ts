declare module 'stremio-addon-sdk' {
  export interface AddonInterface {
    manifest: unknown
    get(
      resource: string,
      type: string,
      id: string,
      extra?: unknown,
      config?: unknown,
    ): Promise<unknown>
  }
  export class addonBuilder {
    constructor(manifest: unknown)
    defineCatalogHandler(handler: (args: unknown) => Promise<unknown>): this
    defineMetaHandler(handler: (args: unknown) => Promise<unknown>): this
    defineStreamHandler(handler: (args: unknown) => Promise<unknown>): this
    getInterface(): AddonInterface
  }
  export function serveHTTP(
    addon: AddonInterface,
    options: { port: number; static?: string },
  ): Promise<{ url: string; server: import('node:http').Server }>
}
