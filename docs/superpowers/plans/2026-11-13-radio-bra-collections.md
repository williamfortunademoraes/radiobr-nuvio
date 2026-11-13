# RADIO BRA Collections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expose Nuvio home collections for 18 musical genres and Brazilian regions/states while preserving existing radio playback and catalog behavior.

**Architecture:** Keep the existing Stremio `tv` addon contract. Add pure genre/location definitions and grouping, then make the catalog service resolve collection cards and station results from one cached station list. Serve deterministic local SVG covers through the existing HTTP server.

**Tech Stack:** TypeScript, Stremio Addon SDK 1.6.10, Vitest, Node HTTP server, SVG assets.

**Spec:** `docs/superpowers/specs/2026-11-13-radio-bra-collections-design.md`

## Global Constraints

- Use only explicit Radio Browser tags for genre association.
- Use only normalized `state` values for geographic association.
- Preserve `tv`, station IDs, streams, metadata, favorites compatibility, and `radio-br-catalog`.
- Do not create a frontend, database, admin panel, audio proxy, or image proxy.
- Keep collection cards square and use stable IDs.
- Unknown or missing metadata remains unassociated.

## Review Focus

- A station with multiple explicit genre tags appears in every matching genre: test in `tests/catalog/grouping.test.ts`.
- State aliases and accents map to exactly one UF while unknown values remain pending: test in `tests/stations/locations.test.ts`.
- Collection cards never collide with station IDs and point to valid local covers: test in `tests/catalog/catalog.test.ts` and `tests/assets.test.ts`.
- Existing station catalog and streams remain unchanged: regression tests in existing catalog/addon tests.
- Missing favicon/state/tags does not create invented associations: tests in grouping and catalog suites.

### Task 1: Genre and location domain data

**Files:**

- Modify: `src/stations/tags.ts`
- Create: `src/stations/locations.ts`
- Create: `tests/stations/locations.test.ts`
- Modify: `tests/catalog/grouping.test.ts`

**Interfaces:**

- Produce `GENRE_IDS`, `genreDefinitions`, `resolveGenre`, and `classifyStationTags` for exactly the requested 18 genres plus internal unknown handling.
- Produce `BRAZILIAN_STATES`, `BRAZILIAN_REGIONS`, `normalizeBrazilianState`, and `statesForRegion`.

- [ ] Write failing tests for all 18 genre names, multi-genre tags, all 27 UFs, accented state names, region membership, and unknown values.
- [ ] Run the focused tests and confirm failure.
- [ ] Implement explicit alias tables and location normalization without inference.
- [ ] Run focused tests and confirm pass.

### Task 2: Grouping and collection definitions

**Files:**

- Modify: `src/catalog/grouping.ts`
- Create: `src/catalog/collections.ts`
- Create: `tests/catalog/collections.test.ts`

**Interfaces:**

- Produce `groupStationsByState(stations): Record<StateId, Station[]>` and `groupStationsByRegion(stations): Record<RegionId, Station[]>`.
- Produce stable collection definitions with `id`, `name`, `poster`, and parent/child relationships.

- [ ] Write failing tests for state grouping, regional aggregation, duplicate station UUID removal, and unknown location exclusion.
- [ ] Run focused tests and confirm failure.
- [ ] Implement pure grouping and stable collection metadata.
- [ ] Run focused tests and confirm pass.

### Task 3: Local collection covers and asset serving

**Files:**

- Create: `assets/collections/*.svg`
- Modify: `src/index.ts`
- Create: `tests/assets.test.ts`

- [ ] Write failing tests that verify every genre, region, and state cover resolves to a local asset URL and SVG assets exist.
- [ ] Run focused tests and confirm failure.
- [ ] Add deterministic dark gradient SVG covers with readable labels and serve `/assets/collections/*` from the existing server.
- [ ] Run focused tests and confirm pass.

### Task 4: Catalog and manifest navigation

**Files:**

- Modify: `src/catalog/catalog.ts`
- Modify: `src/addon/manifest.ts`
- Modify: `src/metadata/metadata.ts` if collection metadata requires it
- Modify: `tests/catalog/catalog.test.ts`
- Modify: `tests/addon/manifest.test.ts`

- [ ] Write failing tests for the home collection catalogs, genre → stations, region → states, state → stations, invalid IDs, search, and legacy catalog behavior.
- [ ] Run focused tests and confirm failure.
- [ ] Implement catalog IDs, previews, filters, and manifest registration while preserving old IDs.
- [ ] Run focused tests and confirm pass.

### Task 5: Documentation and full verification

**Files:**

- Modify: `docs/architecture.md`
- Modify: `README.md` if commands or capabilities need updating

- [ ] Document the collection hierarchy, metadata rules, and Nuvio rendering boundary.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run format:check`.
- [ ] Inspect `git diff` and verify no frontend/admin/proxy was introduced.
