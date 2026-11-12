# Endpoints

## Radio Browser

`GET {RADIO_BROWSER_BASE_URL}/json/stations/search`

Parâmetros enviados sempre: `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` e `offset`. Pesquisa usa `name`. As requisições usam o User-Agent configurado.

## Addon Stremio

- `GET /manifest.json`
- `GET /catalog/tv/radio-br-catalog.json` ou com `?search=...`
- `GET /meta/tv/radio-br:{stationuuid}.json`
- `GET /stream/tv/radio-br:{stationuuid}.json`

Os caminhos são atendidos pelo SDK; o addon retorna URLs diretas cadastradas pela fonte.
