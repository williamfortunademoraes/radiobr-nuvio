# Portal de rádios e player web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a home do RADIO BR em um portal de descoberta e reprodução de rádios brasileiras, com player global, filtros, destaques, gêneros, regiões e favoritos, preservando o addon.

**Architecture:** O servidor Express continuará renderizando a estrutura HTML e fornecerá uma API agregada de estações baseada no `RadioBrowserClient` e nos serviços de catálogo existentes. O navegador manterá o estado da estação e favoritos em `localStorage`, usando um único elemento `Audio` no player fixo para trocar de rádio sem sair da página. A página individual continuará como fallback compartilhável.

**Tech Stack:** TypeScript, Express, HTML server-rendered, CSS vanilla, JavaScript browser vanilla, Vitest e Playwright.

**Spec:** `docs/superpowers/specs/2026-11-14-radio-portal-design.md`

## Global Constraints

- Reutilizar Express, TypeScript, HTML renderizado no servidor e os assets existentes.
- Reutilizar `RadioBrowserClient`, normalização, ranking, gêneros, estados e cache já presentes.
- Não introduzir framework de frontend para esta entrega.
- Favoritos e estação atual ficam em `localStorage`; se estiver indisponível, a sessão continua utilizável.
- Manter a reprodução como stream direto da emissora, sem proxy ou retransmissão.
- Preservar `/personalizar`, `/configure`, `/config` e os contratos públicos do addon.

## Review Focus

- Uma estação sem logo, cidade, codec, bitrate ou URL deve continuar aparecendo com fallback e sem quebrar o catálogo. Teste em `tests/web/home-data.test.ts`.
- Uma resposta vazia ou falha do Radio Browser deve gerar estado de erro amigável na API/home, sem afetar manifestos. Teste em `tests/web/home-data.test.ts` e `tests/web/server.test.ts`.
- Trocar rapidamente de estação deve pausar a anterior e manter apenas uma fonte de áudio ativa. Teste em `tests/browser/radio-portal.spec.ts`.
- Favoritos e estação atual devem sobreviver ao recarregamento, mas funcionar também com `localStorage` indisponível. Teste em `tests/browser/radio-portal.spec.ts`.
- O player fixo não pode cobrir controles ou conteúdo em viewport móvel. Teste de viewport em `tests/browser/radio-portal.spec.ts`.

## Arquivos e responsabilidades

- Create: `src/web/home-data.ts` — tipos e agregação de estações para as seções da home.
- Modify: `src/server.ts` — endpoint da home/catalogação e injeção de dados necessários.
- Modify: `src/web/pages.ts` — template do portal, cards, player global e navegação.
- Modify: `assets/discover.js` — busca, filtros, cards dinâmicos, seleção de rádio e favoritos.
- Modify: `assets/site.css` — layout do portal, cards, player fixo e responsividade.
- Modify: `assets/radio-player.js` — compartilhamento do comportamento de favoritos e reprodução da página individual quando necessário.
- Create: `tests/web/home-data.test.ts` — agregação e serialização.
- Modify: `tests/web/pages.test.ts` — contrato visual mínimo do portal/player.
- Modify: `tests/web/server.test.ts` ou teste HTTP existente equivalente — endpoint e preservação das rotas.
- Create: `tests/browser/radio-portal.spec.ts` — fluxos de busca, reprodução, favoritos e mobile.

### Task 1: Criar o modelo de dados agregado da home

**Files:**
- Create: `src/web/home-data.ts`
- Test: `tests/web/home-data.test.ts`

**Interfaces:**
- Produces `HomeStation`, com `id`, `stationUuid`, `name`, `favicon?`, `homepage?`, `city?`, `state?`, `stateName?`, `codec?`, `bitrate?`, `slogan?`, `url?`, `urlResolved?`, `tags`.
- Produces `HomeSection`, com `id`, `title`, `kind` e `stations: HomeStation[]`.
- Produces `HomePortalData`, com `featured`, `genres`, `regions` e `availableGenres`.
- Produces `buildHomePortalData(stations: Station[], maxPerSection?: number): HomePortalData`.

- [ ] **Step 1: Escrever testes falhando** para preservar campos, limitar cada seção, remover duplicadas, ordenar destaques por `clickcount`, agrupar gêneros conhecidos e agrupar regiões/estados.
- [ ] **Step 2: Rodar `npx vitest run tests/web/home-data.test.ts`** e confirmar falha por módulo/função ausente.
- [ ] **Step 3: Implementar `buildHomePortalData`** reutilizando `groupStationsByGenre`, `REGIONS`/`stationRegion`, `musicGenreDefinitions` ou suas fontes existentes; excluir estações sem URL de reprodução das seções reproduzíveis.
- [ ] **Step 4: Rodar o teste novamente** e confirmar PASS.
- [ ] **Step 5: Rodar `npm run build`** para verificar tipos.

### Task 2: Expor os dados da home sem afetar o addon

**Files:**
- Modify: `src/server.ts`
- Test: `tests/web/server.test.ts` ou teste HTTP existente equivalente

**Interfaces:**
- Produces `GET /api/home`, retornando `HomePortalData` em JSON com cache público curto.
- Consumes `RadioBrowserClient.searchAllStations()` quando disponível, com fallback para `searchStations()`.

- [ ] **Step 1: Escrever teste HTTP falhando** para `/api/home`, incluindo seções, campos de reprodução e status 500 controlado em erro do cliente.
- [ ] **Step 2: Rodar o teste específico** e confirmar falha.
- [ ] **Step 3: Implementar a rota** após a criação do client, usando `buildHomePortalData`; não alterar rotas `/manifest.json`, `/:config/manifest.json`, `/catalog`, `/meta` ou `/stream`.
- [ ] **Step 4: Rodar o teste específico** e confirmar PASS.
- [ ] **Step 5: Rodar `npm test -- --runInBand` ou `npm test`** e confirmar que os testes existentes do addon continuam passando.

### Task 3: Renderizar o novo portal e player global

**Files:**
- Modify: `src/web/pages.ts`
- Modify: `tests/web/pages.test.ts`

**Interfaces:**
- `renderLandingPage()` deve incluir header de portal, busca com filtros, containers `featured`, `genres`, `regions`, `favorites`, `home-status` e um player global com `audio#global-audio`.
- Cada card deve expor `data-station` JSON seguro ou atributos equivalentes com URL, logo e metadados mínimos.
- A entrada para `/personalizar` deve permanecer visível no header e em um bloco de integração.

- [ ] **Step 1: Atualizar testes falhando** para exigir os novos containers, `audio#global-audio`, ação de personalização e preservação do script.
- [ ] **Step 2: Rodar `npx vitest run tests/web/pages.test.ts`** e confirmar falha.
- [ ] **Step 3: Implementar o template** com fallback estático inicial carregável, cards acessíveis, navegação por âncoras e player fixo vazio com estado “Escolha uma rádio”.
- [ ] **Step 4: Rodar os testes de página** e confirmar PASS.

### Task 4: Implementar interação de catálogo, player e favoritos

**Files:**
- Modify: `assets/discover.js`
- Modify: `assets/radio-player.js` se houver lógica compartilhada necessária
- Test: `tests/browser/radio-portal.spec.ts`

**Interfaces:**
- `discover.js` consome `GET /api/home` e mantém um `HTMLAudioElement` global.
- Selecionar um card atualiza nome/logo/metadados, define `audio.src`, chama `audio.play()` e marca a estação ativa.
- Favoritos usam uma chave versionada, por exemplo `radio-br:favorites:v1`, e são renderizados na seção própria.

- [ ] **Step 1: Criar teste Playwright falhando** para carregar a home, buscar uma estação mockada, iniciar reprodução, trocar estação, favoritar e recarregar.
- [ ] **Step 2: Rodar o teste específico** e confirmar falha pelos seletores ausentes.
- [ ] **Step 3: Implementar carregamento, filtros, busca, renderização segura de dados, seleção de áudio, tratamento de erro/play bloqueado e persistência de favoritos.
- [ ] **Step 4: Adicionar fallback para `localStorage` indisponível** e respeitar `prefers-reduced-motion` no comportamento visual.
- [ ] **Step 5: Rodar o teste de browser** e confirmar PASS.

### Task 5: Aplicar o visual de portal e responsividade

**Files:**
- Modify: `assets/site.css`
- Test: `tests/browser/radio-portal.spec.ts`

- [ ] **Step 1: Adicionar asserções de viewport** para player fixo, cards em uma coluna, busca utilizável e ausência de overflow horizontal em 390px.
- [ ] **Step 2: Rodar o teste mobile** e confirmar falha visual/estrutural antes do CSS final.
- [ ] **Step 3: Implementar estilos** para hero de descoberta, filtros, trilhos/grids, cards com hover/focus, player fixo, estados vazios/erro e breakpoints desktop/mobile; manter o sistema de cores RADIO BR.
- [ ] **Step 4: Rodar o teste mobile** e confirmar PASS.
- [ ] **Step 5: Rodar `npm run format:check` e `npm run lint`** e corrigir somente problemas introduzidos.

### Task 6: Verificação final e documentação de uso

**Files:**
- Modify: `README.md` — explicar a home/player e manter instruções do addon.
- Modify: `docs/endpoints.md` — documentar `GET /api/home`.

- [ ] **Step 1: Rodar `npm test`** e confirmar suíte completa PASS.
- [ ] **Step 2: Rodar `npm run build`, `npm run lint`, `npm run format:check`** e confirmar PASS.
- [ ] **Step 3: Rodar `npm run test:ui`** e confirmar os fluxos de portal em desktop e mobile.
- [ ] **Step 4: Conferir manualmente `/`, `/personalizar`, `/manifest.json` e uma página `/radio/:stationUuid`** no servidor local.
- [ ] **Step 5: Atualizar documentação** com o endpoint, comportamento do player e limitações de streams diretos.
