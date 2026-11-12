# RADIO BR Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a fundação verificável do addon RADIO BR, com uma fixture de estação, catálogo, metadados e stream compatíveis com o protocolo Stremio.

**Architecture:** Um cliente Radio Browser com `fetch` e cache injetáveis alimenta normalização/validação de estações. Módulos independentes geram catálogo, metadados e streams; o módulo `addon` compõe esses serviços nos handlers oficiais do SDK.

**Tech Stack:** Node.js, TypeScript estrito, `stremio-addon-sdk`, Vitest, ESLint, Prettier, `fetch` nativo.

**Spec:** `docs/superpowers/specs/2026-11-11-radio-br-mvp-design.md`

## Global Constraints

- Nome exibido: `RADIO BR`.
- ID do addon: `com.williamfortuna.radio-br`.
- Versão: `0.1.0`.
- Tipo: `tv`.
- Recursos: `catalog`, `meta`, `stream`.
- Consulta Radio Browser sempre com `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` e `offset`.
- IDs de estações começam com `radio-br:` e derivam de `stationuuid`.
- `url_resolved` precede `url`; nenhum proxy ou retransmissão.
- Testes automatizados usam fixtures/mocks e não chamam serviços externos.
- Reprodução no Nuvio será registrada separadamente e nunca inferida dos testes automatizados.
- Não implementar frontend, banco, painel, cadastro manual ou funcionalidades da Fase 2.

## Review Focus

- Contratos do SDK podem mudar: a primeira tarefa deve instalar/fixar a versão e verificar diretamente os tipos e exemplos oficiais de `AddonBuilder`, `defineCatalogHandler`, `defineMetaHandler` e `defineStreamHandler`.
- `lastcheckok` pode vir ausente, numérico ou textual: os testes de normalização devem distinguir falha explícita de ausência de informação.
- URLs podem ser vazias ou inválidas: o teste de stream deve rejeitar IDs inválidos e não retornar stream sem URL utilizável.
- Pesquisa e paginação precisam preservar os parâmetros Radio Browser: o teste deve verificar `search`, `skip`, `limit` e cache por chave distinta.
- Falhas HTTP/JSON/rede não podem produzir catálogo falso: os testes do cliente devem verificar erro estável e ausência de fallback inventado.

## Mapa de arquivos

Arquivos de configuração: `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.env.example`.

Código: `src/config/index.ts`, `src/radio-browser/types.ts`, `src/radio-browser/cache.ts`, `src/radio-browser/client.ts`, `src/stations/types.ts`, `src/stations/normalize.ts`, `src/catalog/catalog.ts`, `src/metadata/metadata.ts`, `src/streams/streams.ts`, `src/addon/manifest.ts`, `src/addon/create-addon.ts`, `src/index.ts`.

Testes: `tests/fixtures/station.ts`, `tests/stations/normalize.test.ts`, `tests/radio-browser/client.test.ts`, `tests/catalog/catalog.test.ts`, `tests/metadata/metadata.test.ts`, `tests/streams/streams.test.ts`, `tests/addon/manifest.test.ts`, `tests/addon/handlers.test.ts`.

Documentação: `README.md`, `docs/architecture.md`, `docs/endpoints.md`, `docs/compatibility-report.md`.

### Task 1: Inicializar o projeto e verificar contratos do SDK

**Files:**

- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`, `.prettierrc`, `.env.example`
- Create: `src/config/index.ts`
- Test: `tests/addon/manifest.test.ts`

**Interfaces:**

- Produces: scripts `test`, `test:watch`, `build`, `lint`, `format:check`, `dev`; configuração `AppConfig` com URL base, User-Agent e TTL.

- [ ] Instalar versões estáveis fixadas de TypeScript, SDK, Vitest, ESLint e Prettier.
- [ ] Consultar os tipos instalados e a documentação oficial do SDK para confirmar assinaturas de `AddonBuilder` e dos três handlers; registrar a versão no plano/README.
- [ ] Criar teste RED que importe o manifest futuro e verifique nome, ID, versão, recursos, tipo `tv` e catálogo.
- [ ] Executar `npm test -- tests/addon/manifest.test.ts`; confirmar falha por arquivos/manifest ausentes.
- [ ] Criar configuração mínima e implementação inicial de `src/addon/manifest.ts` com os valores exatos.
- [ ] Executar o teste específico e depois `npm run build`, `npm run lint` e `npm run format:check`; esperar PASS.

### Task 2: Criar tipos, fixture e normalização de estações

**Files:**

- Create: `src/radio-browser/types.ts`, `src/stations/types.ts`, `src/stations/normalize.ts`
- Create: `tests/fixtures/station.ts`, `tests/stations/normalize.test.ts`

**Interfaces:**

- Produces: `RadioBrowserStation`, `Station`, `normalizeStation(raw: RadioBrowserStation): Station | null`, `stationId(stationuuid: string): string`, `isBrazilianAvailableStation(raw): boolean`.

- [ ] Escrever testes RED para estação brasileira válida, país diferente, `lastcheckok=0`, ausência de URL, ID determinístico e campos opcionais ausentes.
- [ ] Executar o teste e confirmar falha pela ausência da normalização.
- [ ] Implementar tipos e normalização sem inventar descrição, idioma, estado ou tags ausentes.
- [ ] Normalizar tags em lista, preservar codec/bitrate/hls quando presentes e priorizar `url_resolved`.
- [ ] Executar `npm test -- tests/stations/normalize.test.ts`; esperar PASS.

### Task 3: Implementar cache e cliente Radio Browser

**Files:**

- Create: `src/radio-browser/cache.ts`, `src/radio-browser/client.ts`
- Test: `tests/radio-browser/client.test.ts`

**Interfaces:**

- Produces: `MemoryCache<T>`, `RadioBrowserClient`, `searchStations(options: SearchOptions): Promise<Station[]>`.
- Consumes: tipos e normalização da Task 2; `AppConfig` da Task 1.

- [ ] Escrever testes RED para montagem dos parâmetros obrigatórios, busca com nome, offset, cache antes do TTL, expiração após TTL e falhas HTTP/JSON/rede.
- [ ] Executar os testes e confirmar falhas esperadas.
- [ ] Implementar cache em memória por chave e TTL configurável, com relógio injetável quando necessário.
- [ ] Implementar cliente com `fetch` injetável, User-Agent descritivo e endpoint `/json/stations/search`.
- [ ] Fazer o cliente filtrar/normalizar exclusivamente resultados brasileiros e disponíveis conforme a regra definida.
- [ ] Executar `npm test -- tests/radio-browser/client.test.ts`; esperar PASS.

### Task 4: Gerar catálogo e pesquisa

**Files:**

- Create: `src/catalog/catalog.ts`
- Test: `tests/catalog/catalog.test.ts`

**Interfaces:**

- Produces: `createCatalogService(client): { getCatalog(args): Promise<CatalogResponse> }`.
- Consumes: `RadioBrowserClient.searchStations`; tipos de preview do SDK confirmados na Task 1.

- [ ] Escrever testes RED para catálogo padrão, pesquisa por `extra.search`, paginação por `extra.skip`, IDs únicos e lista vazia.
- [ ] Executar os testes e confirmar falha.
- [ ] Implementar transformação de `Station` para `MetaPreview`, usando poster apenas quando houver favicon e tipo `tv`.
- [ ] Mapear `skip` para `offset` sem exceder o limite configurado.
- [ ] Executar `npm test -- tests/catalog/catalog.test.ts`; esperar PASS.

### Task 5: Gerar metadados

**Files:**

- Create: `src/metadata/metadata.ts`
- Test: `tests/metadata/metadata.test.ts`

**Interfaces:**

- Produces: `createMetadataService(client): { getMetadata(args): Promise<MetaResponse> }`.
- Consumes: ID `radio-br:<stationuuid>` e busca do cliente.

- [ ] Escrever testes RED para metadados completos, campos opcionais ausentes, ID inválido e estação não encontrada.
- [ ] Executar os testes e confirmar falha.
- [ ] Implementar descrição baseada somente em homepage, estado, idioma, tags, codec e bitrate existentes; não gerar texto factual ausente.
- [ ] Retornar meta vazia para tipo/ID não suportados conforme contrato confirmado do SDK.
- [ ] Executar `npm test -- tests/metadata/metadata.test.ts`; esperar PASS.

### Task 6: Resolver streams

**Files:**

- Create: `src/streams/streams.ts`
- Test: `tests/streams/streams.test.ts`

**Interfaces:**

- Produces: `createStreamService(client): { getStreams(args): Promise<StreamResponse> }`.
- Consumes: ID estável, `Station.urlResolved`, `Station.url`, codec, bitrate e hls.

- [ ] Escrever testes RED para `url_resolved`, fallback `url`, ID inválido, estação inexistente, URL ausente e metadados opcionais do stream.
- [ ] Executar os testes e confirmar falha.
- [ ] Implementar validação estrita do prefixo/UUID e retorno de uma URL direta, sem proxy.
- [ ] Não testar disponibilidade real da URL como se fosse garantia de reprodução; isso pertence ao relatório manual.
- [ ] Executar `npm test -- tests/streams/streams.test.ts`; esperar PASS.

### Task 7: Compor o addon com handlers oficiais

**Files:**

- Create: `src/addon/create-addon.ts`, `src/index.ts`
- Test: `tests/addon/handlers.test.ts`

**Interfaces:**

- Produces: `createAddon(options): AddonInterface` ou tipo equivalente exportado pelo SDK instalado; entrypoint que inicia o servidor local.
- Consumes: manifest e serviços das Tasks 4–6.

- [ ] Escrever testes RED que invoquem os handlers através da composição e verifiquem catálogo, meta e stream para a fixture.
- [ ] Executar os testes e confirmar falha.
- [ ] Instanciar `AddonBuilder` com o manifest e registrar `defineCatalogHandler`, `defineMetaHandler` e `defineStreamHandler` usando as assinaturas verificadas.
- [ ] Retornar exatamente `{ metas }`, `{ meta }` e `{ streams }`, acrescidos apenas de cache headers suportados pelo SDK quando aplicável.
- [ ] Implementar `src/index.ts` para executar o servidor local sem frontend ou proxy.
- [ ] Executar testes, build e uma validação local do manifest/rotas; esperar PASS.

### Task 8: Documentar execução, endpoints e compatibilidade

**Files:**

- Create: `README.md`, `docs/architecture.md`, `docs/endpoints.md`, `docs/compatibility-report.md`

- [ ] Documentar instalação, `.env`, `npm run dev`, URL do manifest e comandos de validação.
- [ ] Documentar endpoint Radio Browser, parâmetros obrigatórios, User-Agent, cache e tratamento de indisponibilidade.
- [ ] Documentar limites: não proxyar, não modificar Nuvio, URLs cadastradas não equivalem a reprodução.
- [ ] Criar tabela de compatibilidade com estados `não executado`, `passou` ou `falhou`, separando MP3, AAC/AAC+, OGG e HLS por plataforma.
- [ ] Executar a suíte completa e registrar somente resultados reais no relatório.

### Task 9: Verificação final da Fase 1

**Files:**

- Modify: documentação e código apenas quando uma verificação encontrar falha reproduzível.

- [ ] Executar `npm test -- --run`, `npm run build`, `npm run lint` e `npm run format:check`.
- [ ] Validar que nenhum teste faz rede externa e que a fixture é a única estação usada nos testes.
- [ ] Iniciar o addon localmente e consultar manifest/catalog/meta/stream com requisições locais.
- [ ] Registrar no relatório o que foi comprovado pelo addon e o que continua pendente no Nuvio.
- [ ] Parar após o relatório da Fase 1; não iniciar funcionalidades da Fase 2.
