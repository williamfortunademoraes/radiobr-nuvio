# RADIO BR Organized Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the versioned Top 25 editorial catalog, independent genre/region/state catalogs, complete national pagination, visual assets, and the required report without breaking Nuvio/Stremio routes or stream IDs.

**Architecture:** Keep the existing Stremio `tv` catalog/meta/stream contracts. Add pure data modules for the Radios.com.br snapshot, IBGE/state/region definitions, catalog covers and editorial matching; extend the Radio Browser client with a lazy full-catalog cache and keep catalog handlers as the adapter layer. Region/state navigation is represented by flat catalogs because the protocol has no nested navigation.

**Tech Stack:** TypeScript, Stremio Addon SDK 1.6.10, Express, Vitest, Playwright, SVG assets.

**Spec:** `docs/superpowers/specs/2026-11-12-radio-br-organized-catalog-design.md`

## Global Constraints

- The Top 25 snapshot is the Radios.com.br FM Brazil report for July/2026; never replace it with Radio Browser `clickcount`.
- Exactly 25 editorial entries must be exposed; unmatched entries remain visible as unavailable and are reported.
- Preserve existing `radio-br:<stationuuid>` identifiers, logos and stream URLs.
- Never infer city, UF or IBGE from station names, domains, phone numbers or URLs.
- Preserve `type: tv` and existing catalog/meta/stream route contracts.
- Do not create a frontend, admin panel, external service or database.

## Review Focus

- Editorial rows missing from Radio Browser must not be replaced or silently dropped; covered by `tests/editorial/top-25.test.ts`.
- A station with a city but no reliable state must not enter a state/region catalog; covered by `tests/catalog/geography.test.ts`.
- Catalog pagination must not duplicate or omit stations at page boundaries; covered by `tests/catalog/catalog.test.ts` and `tests/radio-browser/client.test.ts`.
- Stations without location must remain in the national catalog; covered by `tests/catalog/geography.test.ts`.
- Catalog cover assets must never override a station favicon; covered by `tests/catalog/catalog.test.ts`.

### Task 1: Versionar o ranking Top 25 e o cruzamento editorial

**Files:**

- Create: `src/editorial/top-25-ranking.ts`
- Create: `src/editorial/top-25-match.ts`
- Modify: `src/editorial/types.ts`
- Modify: `src/editorial/resolve.ts`
- Test: `tests/editorial/top-25.test.ts`

**Interfaces:**

- Produces `top25Ranking`, an ordered readonly array of 25 records with `position`, `name`, `location`, `visits`, `sourceUrl` and `radiosComBrUrl`.
- Produces `matchTop25Editorial(ranking, stations)`, returning all 25 entries with `station?: Station` and `matchStatus: 'matched' | 'unmatched'`.

- [ ] **Step 1: Write failing tests** for exactly 25 positions, positions 1–25 in order, source metadata, deterministic name/UF matching, no random fallback, and unmatched preservation.
- [ ] **Step 2: Run `npm exec -- vitest run tests/editorial/top-25.test.ts`** and confirm the new ranking module/matcher is missing or fails the expected assertions.
- [ ] **Step 3: Add the July/2026 snapshot** from the extracted Radios.com.br report, preserving names, locations, visits and URLs exactly as source data.
- [ ] **Step 4: Implement deterministic matching** using explicit aliases for known name variants first and normalized name + explicit UF second; never match by city alone.
- [ ] **Step 5: Run the focused tests** and confirm all Top 25 assertions pass.

### Task 2: Modelar regiões, estados, IBGE e capas

**Files:**

- Modify: `src/stations/states.ts`
- Create: `src/catalog/geography.ts`
- Create: `src/catalog/covers.ts`
- Create: `assets/collections/genres/.gitkeep`
- Create: `assets/collections/regions/.gitkeep`
- Create: `assets/collections/states/.gitkeep`
- Test: `tests/catalog/geography.test.ts`
- Test: `tests/catalog/covers.test.ts`

**Interfaces:**

- Produces `REGIONS`, `STATES` with `ibgeCode` and visual asset reference, `regionForState(code)`, `statesForRegion(region)`, and `stationRegion(station)`.
- Produces `genreCover(id)`, `regionCover(id)` and `stateCover(code)` with stable local asset URLs.

- [ ] **Step 1: Write failing tests** for five regions, 27 state records, all listed UF-to-region relationships, exact IBGE codes, and no classification for missing/ambiguous state.
- [ ] **Step 2: Run the focused geography tests** and confirm the extended fields/helpers are absent or fail.
- [ ] **Step 3: Extend the static state table** with IBGE codes, region IDs and state visual references; keep `normalizeState` behavior compatible.
- [ ] **Step 4: Implement pure geography helpers** that only use normalized explicit state values.
- [ ] **Step 5: Add stable SVG cover/badge assets** under `assets/collections/` and return their local `/assets/...` references without replacing station logos.
- [ ] **Step 6: Run geography and cover tests** and confirm pass.

### Task 3: Atualizar o modelo de estação e o cliente Radio Browser

**Files:**

- Modify: `src/radio-browser/types.ts`
- Modify: `src/stations/types.ts`
- Modify: `src/stations/normalize.ts`
- Modify: `src/radio-browser/client.ts`
- Modify: `src/radio-browser/cache.ts`
- Test: `tests/stations/normalize.test.ts`
- Test: `tests/radio-browser/client.test.ts`

**Interfaces:**

- `Station` retains optional `city`, `clickcount`, `state`, `favicon`, `urlResolved` and existing stream fields.
- Produces `searchAllStations(options?) -> Promise<Station[]>`, cached by the same TTL and deduplicated by station ID.

- [ ] **Step 1: Write failing tests** for city normalization, full pagination across 100-item boundaries, deduplication, stable clickcount ordering and retention of stations with no state.
- [ ] **Step 2: Run the focused client/normalization tests** and confirm the full-catalog method is missing or fails.
- [ ] **Step 3: Implement lazy paginated retrieval** using existing `searchStations({ offset, limit: 100 })`, stop on a short page, dedupe by `stationuuid`, and cache the aggregate result.
- [ ] **Step 4: Keep normal search requests bounded** so genre/state/search catalogs do not suddenly load the entire directory.
- [ ] **Step 5: Run client and normalization tests** and confirm pass.

### Task 4: Implementar catálogos editoriais, gêneros, regiões, estados e nacional

**Files:**

- Modify: `src/config/addon-config.ts`
- Modify: `src/catalog/catalog.ts`
- Modify: `src/catalog/grouping.ts`
- Modify: `src/editorial/radios-em-destaque.ts`
- Modify: `src/addon/manifest.ts`
- Test: `tests/catalog/catalog.test.ts`
- Test: `tests/catalog/grouping.test.ts`
- Test: `tests/addon/manifest.test.ts`
- Test: `tests/addon/http.test.ts`

**Interfaces:**

- Consumes Task 1 `matchTop25Editorial`, Task 2 geography/covers, and Task 3 `searchAllStations`.
- Produces the existing `radios-em-destaque` catalog with 25 metas, five region catalogs, 27 state catalogs, independent genre catalogs, and paginated national results.

- [ ] **Step 1: Write failing integration tests** for 25 editorial metas/order, five regions, 27 UF catalogs, region membership, national pagination and station poster preservation.
- [ ] **Step 2: Run catalog/manifest/HTTP tests** and confirm current 13-item/flat-state behavior fails the new assertions.
- [ ] **Step 3: Replace the editorial source** with the Top 25 snapshot and map unmatched entries to unavailable editorial metas without inventing streams.
- [ ] **Step 4: Add region and state catalog definitions** while preserving `radio-br-region-{uf}` routes and adding region IDs with unambiguous handling.
- [ ] **Step 5: Route each catalog** through the appropriate bounded or full cached station set; filter by explicit UF/region and dedupe by station ID.
- [ ] **Step 6: Keep logos precedence**: station favicon/logo first, collection cover only as a fallback where the protocol permits it.
- [ ] **Step 7: Run focused integration tests** and confirm pass.

### Task 5: Atualizar a personalização e textos atuais

**Files:**

- Modify: `src/web/pages.ts`
- Modify: `assets/personalizar.js`
- Modify: `tests/browser/wizard.spec.ts`

**Interfaces:**

- Consumes the catalog/config definitions from Tasks 2 and 4.
- Produces configuration UI labels and generated manifests consistent with 25 highlights, genres, regions and states.

- [ ] **Step 1: Write failing browser assertions** for Destaques, region/state choices, no obsolete ranking labels, and generated catalog IDs.
- [ ] **Step 2: Run the browser test** and confirm the current wizard does not expose the new structure.
- [ ] **Step 3: Update page copy, collection cards, region/state controls and generated selection payloads** without introducing a separate frontend application.
- [ ] **Step 4: Run the browser suite** at mobile and desktop widths and confirm pass.

### Task 6: Capas, relatório e documentação final

**Files:**

- Modify: `docs/architecture.md`
- Modify: `docs/endpoints.md`
- Create: `docs/RADIO_BR_ORGANIZED_CATALOG_REPORT.md`
- Modify: `docs/RADIOS_EM_DESTAQUE.md`
- Test: `tests/addon/personalization.test.ts`

- [ ] **Step 1: Write failing documentation/manifest assertions** for the new catalog IDs and report-linked source metadata.
- [ ] **Step 2: Update current-behavior documentation** with source, matching criteria, pagination, geography limitations, visual asset limitations and unmatched ranking entries.
- [ ] **Step 3: Add the implementation report** listing modified/created files, final collections, data sources, criteria, limitations, test results and Nuvio visual follow-ups.
- [ ] **Step 4: Run the complete verification suite:** `npm exec -- vitest run`, `npm exec -- playwright test`, `npm exec -- eslint src tests assets/personalizar.js`, `npm exec -- tsc -p tsconfig.json`, `npm exec -- prettier --check ...`.
