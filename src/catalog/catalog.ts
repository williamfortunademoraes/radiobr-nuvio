import type { RadioBrowserClient } from '../radio-browser/client.js'
import type { Station } from '../stations/types.js'
export interface CatalogArgs {
  type: string
  id: string
  extra?: { search?: string; skip?: number }
}
export function stationPreview(station: Station) {
  return {
    id: station.id,
    type: 'tv',
    name: station.name,
    ...(station.favicon
      ? { poster: station.favicon, posterShape: 'square' }
      : {}),
  }
}
export function createCatalogService(client: RadioBrowserClient) {
  return {
    async getCatalog(args: CatalogArgs) {
      if (args.type !== 'tv' || args.id !== 'radio-br-catalog')
        return { metas: [] }
      const stations = await client.searchStations({
        search: args.extra?.search,
        offset: args.extra?.skip ?? 0,
      })
      return { metas: stations.map(stationPreview) }
    },
  }
}
