# Catálogo e metadados das rádios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplificar as categorias e coleções do RADIO BR e melhorar a descrição das rádios no Nuvio/Stremio com localização e gêneros linkados.

**Architecture:** As categorias continuam sendo definidas em `stations/tags.ts` e agrupadas localmente. A configuração do addon expõe apenas a curadoria editorial de 13 rádios, as novas coleções e os gêneros consolidados. Metadados usam um helper puro para compor texto/Markdown a partir dos dados reais da estação, sem inferência de cidade.

**Tech Stack:** TypeScript, Stremio Addon SDK, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-12-radio-catalog-and-metadata-design.md`

## Global Constraints

- Manter somente a coleção editorial com 13 rádios em destaque; remover a coleção de ranking automático.
- Fundir Notícias e Esportes, Samba e Pagode, e Outros gêneros com Gênero não informado.
- Retirar “TV”, país e idioma dos nomes e descrições visíveis; manter `type: tv` no contrato técnico.
- Não inferir cidade, gênero ou idioma por nome, domínio ou telefone.
- Preservar IDs de estação, URLs de stream e compatibilidade dos endpoints existentes quando possível.

## Review Focus

- Estação sem cidade: descrição não deve inventar cidade; coberto em `tests/metadata/metadata.test.ts`.
- Tags genéricas/país: não devem aparecer como gêneros; coberto em `tests/metadata/metadata.test.ts`.
- Tags de samba/pagode ou notícias/esportes: devem cair no grupo consolidado; coberto em `tests/stations/tags.test.ts` e `tests/catalog/grouping.test.ts`.
- Configuração antiga contendo IDs removidos: deve ser rejeitada ou migrada de forma determinística, sem expor catálogo inválido; coberto em `tests/addon/manifest.test.ts` e `tests/addon/personalization.test.ts`.
- Clientes que não renderizam Markdown: a descrição ainda deve conter rótulos e valores legíveis; coberto em `tests/metadata/metadata.test.ts`.

### Task 1: Consolidar classificação e agrupamento

**Files:**

- Modify: `src/stations/tags.ts`
- Modify: `src/catalog/grouping.ts`
- Test: `tests/stations/tags.test.ts`
- Test: `tests/catalog/grouping.test.ts`

**Interfaces:**

- Produces the canonical genre IDs/names consumed by configuration, catalogs and metadata.

- [ ] **Step 1: Write failing tests** for `Notícias e esportes`, `Samba e pagode`, and a single `Outros gêneros` bucket for unknown/no tags.
- [ ] **Step 2: Run the focused tests** and confirm the old separate categories fail the new expectations.
- [ ] **Step 3: Update aliases and `GENRE_IDS`** so the canonical IDs are `noticias-esportes`, `samba-pagode`, and `outros`, with no `nao-informado`; update grouping fallback to `outros`.
- [ ] **Step 4: Run focused tests** and confirm classification and grouping pass.

### Task 2: Atualizar coleções, manifesto e página de personalização

**Files:**

- Modify: `src/config/addon-config.ts`
- Modify: `src/catalog/catalog.ts`
- Modify: `src/web/pages.ts`
- Modify: `assets/personalizar.js`
- Test: `tests/addon/manifest.test.ts`
- Test: `tests/addon/personalization.test.ts`
- Test: `tests/browser/wizard.spec.ts`

**Interfaces:**

- Consumes canonical genres from Task 1.
- Produces `buildCatalogs`, `catalogAllowed` and page data with only supported collection/genre IDs.

- [ ] **Step 1: Update failing expectations** for one editorial featured collection, consolidated news/sports and the consolidated genre names.
- [ ] **Step 2: Run manifest/personalization tests** and confirm old catalog expectations fail.
- [ ] **Step 3: Remove automatic `featured` ranking from user-visible/default collections**, rename the editorial collection to the 13-radio highlight, replace news/sports/unknown with consolidated collections, and remove visible “TV”, country and language wording.
- [ ] **Step 4: Update catalog handlers** so the editorial catalog remains available and the consolidated categories resolve to their new groups.
- [ ] **Step 5: Update wizard defaults, toggles and copy** so generated configurations contain only current IDs.
- [ ] **Step 6: Run unit and browser tests** for manifest/configuration and confirm pass.

### Task 3: Melhorar metadados individuais

**Files:**

- Modify: `src/radio-browser/types.ts`
- Modify: `src/stations/types.ts`
- Modify: `src/stations/normalize.ts`
- Modify: `src/metadata/metadata.ts`
- Test: `tests/metadata/metadata.test.ts`
- Test: `tests/stations/normalize.test.ts`

**Interfaces:**

- `Station.city?: string` is optional and populated only from an optional source field.
- Add pure helpers in `src/metadata/metadata.ts` for slugifying link values and composing station descriptions.

- [ ] **Step 1: Add failing tests** asserting City/State/Genre labels, `radiosbrasil.com.br` links, omission of country/language/generic tags, and readable fallback when city is absent.
- [ ] **Step 2: Run metadata tests** and confirm the current compact description fails.
- [ ] **Step 3: Add optional city normalization** and implement the description composer with Markdown links for city, state and non-generic tags, plus codec/bitrate when available.
- [ ] **Step 4: Keep poster/website behavior** and apply the new description to normal station metadata without changing the stream contract.
- [ ] **Step 5: Run metadata and normalization tests** and confirm pass.

### Task 4: Atualizar documentação e verificação final

**Files:**

- Modify: relevant docs mentioning removed catalog/category names, including `docs/architecture.md`, `docs/endpoints.md`, and phase reports where they describe current behavior.

- [ ] **Step 1: Run the complete test suite** with `npm test` and the browser suite with `npm run test:browser` (or the project’s equivalent scripts).
- [ ] **Step 2: Search the source and visible copy** for stale “TV”, “Gênero não informado”, separate “Pagode”/“Samba”, separate “Notícias”/“Esportes”, country and language metadata terms.
- [ ] **Step 3: Update only current-behavior documentation** and leave historical reports clearly historical.
- [ ] **Step 4: Run lint/typecheck/build scripts** from `package.json` and record the results.
