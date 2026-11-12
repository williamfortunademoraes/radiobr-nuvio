# Endpoints

## Radio Browser

`GET {RADIO_BROWSER_BASE_URL}/json/stations/search`

Parâmetros enviados sempre: `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` e `offset`. Pesquisa usa `name`. As requisições usam o User-Agent configurado.

## Addon Stremio

- `GET /manifest.json`
- `GET /catalog/tv/radio-br-featured.json` ou com `?search=...`
- `GET /catalog/tv/radio-br-genre.json` ou com `?search=...`
- `GET /catalog/tv/radio-br-genre/genre=Sertanejo.json`
- `GET /catalog/tv/radio-br-catalog.json` ou com `?search=...`
- `GET /meta/tv/radio-br:{stationuuid}.json`
- `GET /stream/tv/radio-br:{stationuuid}.json`

Os extras também são aceitos no formato de segmento de caminho usado pelo SDK, por exemplo `/catalog/tv/radio-br-genre/genre=Sertanejo/search=prova.json`. Valores com acento devem ser percent-encoded (`Not%C3%ADcias`).

O catálogo `radio-br-genre` aceita as treze categorias declaradas no manifest e filtra localmente sobre a mesma consulta base dos demais catálogos. Um valor de gênero desconhecido retorna lista vazia; não há fallback silencioso para o catálogo geral.

Os caminhos são atendidos pelo SDK; o addon retorna URLs diretas cadastradas pela fonte, sem proxy ou conversão.
