# Relatório — enriquecimento automático do catálogo RADIO BR

## Diagnóstico

O projeto já possuía o Radio Browser como fonte dinâmica, IDs estáveis `radio-br:<stationuuid>`, normalização de estação, catálogo paginado e metadata compatível com Nuvio/Stremio. Não havia coleta secundária, resolução de conflitos, proveniência ou snapshot persistente.

## Implementação

Foram adicionados:

- `src/enrichment/types.ts`: contratos de dados e proveniência.
- `src/enrichment/snapshot.ts`: snapshot versionado e merge determinístico.
- `src/enrichment/http.ts`: timeout, retry com backoff e tratamento de HTTP.
- `src/enrichment/sources/`: parsers Radios.com.br, site oficial e Radio Browser.
- `src/enrichment/identity.ts`: associação conservadora por ID, URL, nome/cidade/UF.
- `src/enrichment/normalize.ts`: UF, estado, cidade e categorias.
- `src/enrichment/resolve.ts`: resolução por campo e overlay sem alterar stream/ID.
- `src/enrichment/logo.ts`: validação de imagens e prioridade de logos.
- `src/enrichment/runner.ts`: execução idempotente com concorrência limitada.
- `src/enrichment/storage.ts`: leitura e gravação opcional do snapshot.
- `scripts/enrich-stations.ts`: comando operacional `npm run enrich`.
- `data/enrichment/logo-sources.json`: origem dos logos incorporados.

## Fontes

A rotina prioriza Radios.com.br quando existe URL editorial conhecida, usa o site oficial para completar dados, mantém Radio Browser como base complementar e aceita logos públicos ou fornecidos pelo usuário somente com origem registrada.

## Campos

O overlay suporta nome, cidade, UF, nome do estado, categorias, slogan e logo. O modelo original continua preservando `stationUuid`, `id`, `url`, `urlResolved`, codec, bitrate e reprodução.

## Logos incorporados

Foram registrados os logos de FM O Dia, Nativa, Jovem Pan News e Liberdade. Logos sem fonte segura não são inventados nem substituídos por banners, fotografias ou favicons automaticamente.

## Testes

Foram cobertos: retry, timeout, HTTP 403/404/429/5xx, parsing HTML/JSON-LD/Open Graph, identidade, UF, categorias, conflitos, preservação de IDs/streams, validação de logos, concorrência, falhas isoladas e idempotência.

Última validação: 153 testes unitários aprovados, build TypeScript aprovado, ESLint aprovado e Prettier aprovado.

## Limitações conhecidas

- A execução completa depende de `ADDON_BASE_URL` para transformar logos locais em URLs públicas.
- A fotografia do ranking Top 25 é a única parte que possui links Radios.com.br individuais já conhecidos; emissoras fora dela precisam de referências de busca adicionais.
- O comando não contorna 403, autenticação, robots ou bloqueios; nesses casos o erro é preservado no snapshot e a coleta continua.
- O snapshot gerado em `data/enrichment/stations.json` é ignorado pelo Git e deve ser atualizado pelo ambiente operacional.
- O comando preserva campos verificados do snapshot anterior quando uma execução nova não encontra substituto melhor.
