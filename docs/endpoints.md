# Endpoints

## Página e configuração

- `GET /`: apresentação RADIO BR.
- `GET /personalizar`, `GET /configure`: central em cinco etapas.
- `GET /assets/*`: imagens, CSS e JavaScript.
- `POST /api/configuration`: JSON de até 2 KiB; retorna `{ url, manifest }` após validar e canonicalizar. A URL usa `ADDON_BASE_URL`.

Exemplo de corpo:

```json
{
  "v": 1,
  "c": ["featured"],
  "g": ["sertanejo", "gospel"],
  "s": ["RJ", "SP"],
  "o": { "logos": false }
}
```

Pelo menos uma coleção ou gênero é obrigatório. Estados vazios significam ausência de filtro. Campos desconhecidos, versões diferentes, valores inválidos e excesso de itens retornam 400; corpo acima do limite retorna 413. Não são aceitas URLs externas ou cidades na configuração.

## Protocolo Stremio

- `GET /manifest.json`: instalação padrão preservada.
- `GET /:config/manifest.json`: manifesto dinâmico.
- `GET /:config?/catalog/tv/:catalogId.json`
- `GET /:config?/catalog/tv/:catalogId/:extra.json`
- `GET /:config?/meta/tv/radio-br:{stationuuid}.json`
- `GET /:config?/stream/tv/radio-br:{stationuuid}.json`

`:config` é `encodeURIComponent(JSON.stringify(config))`, formato nativo do SDK 1.6.10. O prefixo acompanha todos os recursos. Configuração inválida retorna 400 antes do SDK; catálogo desativado retorna `{ "metas": [] }`.

Catálogos: `radios-em-destaque`, `radio-br-featured`, `radio-br-catalog`, `radio-br-news`, `radio-br-sports`, `radio-br-nogenero`, `radio-br-genre`, `radio-br-genre-{genreId}`, `radio-br-region-{uf-minúscula}`. Veja opções efetivas no manifesto.

Extras são um único segmento, por exemplo `/catalog/tv/radio-br-genre/genre=Sertanejo&search=prova.json`. Valores devem ser percent-encoded. Não usar vários segmentos ou presumir que `?search=` seja lido pelo SDK.

## Radio Browser

`GET {RADIO_BROWSER_BASE_URL}/json/stations/search`, com `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` (até 100) e `offset`. Pesquisa usa `name`. O cliente compartilha cache TTL e requisições em andamento. Nenhuma configuração permite substituir a origem da API ou URL de stream.
