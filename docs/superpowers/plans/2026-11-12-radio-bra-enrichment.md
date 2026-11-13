# RADIO BRA Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an idempotent, source-prioritized enrichment routine that updates existing Brazilian radio records without changing IDs, streams, or Nuvio/Stremio contracts.

**Architecture:** Add focused enrichment modules for source adapters, identity matching, normalization, conflict resolution, provenance, and snapshot persistence. Keep Radio Browser as the runtime catalog source and make enrichment an explicit command that generates local data consumed as optional overlays.

**Tech Stack:** TypeScript, Node fetch, Vitest, existing Radio Browser client and station models.

**Spec:** `docs/superpowers/specs/2026-11-12-radio-bra-enrichment-design.md`

## Global Constraints

- Preserve `radio-br:<stationuuid>`, stream URLs, catalog routes, metadata contracts and Nuvio/Stremio compatibility.
- Radios.com.br has highest source priority; official websites complete or update it; Radio Browser is complementary.
- Never infer or invent city, state, category, slogan or logo.
- Do not bypass authentication, blocks, rate limits or access controls.
- Missing data remains missing; one source failure must not stop the full run.
- Do not create a frontend, admin panel, external service or parallel playback system.

## Review Focus

- A conflicting source must preserve the higher-quality existing value: test in Task 4.
- A name-only match must not merge stations: test in Task 3.
- A broken or non-image logo must not replace a valid logo: test in Task 5.
- A 403/429/5xx source response must produce a recorded failure and continue: test in Task 2.
- Repeated execution must produce the same snapshot and no duplicate identity: test in Task 6.

### Task 1: Enrichment contracts and snapshot schema

**Files:**

- Create: `src/enrichment/types.ts`
- Create: `src/enrichment/snapshot.ts`
- Test: `tests/enrichment/snapshot.test.ts`

**Interfaces:**

- `EnrichedStationData`: optional `name`, `city`, `state`, `stateName`, `categories`, `slogan`, `logo`.
- `FieldProvenance`: `source`, `url`, `checkedAt`, `status`.
- `EnrichmentRecord`: `stationUuid`, `data`, `provenance`, `updatedAt`.
- `EnrichmentSnapshot`: versioned list of records and failures.
- `mergeSnapshot(previous, incoming) -> EnrichmentSnapshot`.

- [ ] Write failing tests for versioned serialization, stable ordering, absent fields, and merge preservation.
- [ ] Run `npm exec -- vitest run tests/enrichment/snapshot.test.ts` and observe the expected missing-module failure.
- [ ] Implement the contracts and deterministic JSON snapshot helpers.
- [ ] Re-run the focused tests, then the full suite.
- [ ] Commit `feat: add enrichment snapshot contracts`.

### Task 2: HTTP policy and source adapters

**Files:**

- Create: `src/enrichment/http.ts`
- Create: `src/enrichment/sources/radios-com-br.ts`
- Create: `src/enrichment/sources/official-website.ts`
- Create: `src/enrichment/sources/radio-browser.ts`
- Test: `tests/enrichment/sources.test.ts`

**Interfaces:**

- `EnrichmentHttpClient.request(url, options) -> Promise<EnrichmentResponse>`.
- Each adapter exposes `lookup(reference) -> Promise<Partial<EnrichedStationData> & source metadata>`.

- [ ] Write tests for timeout, one retry with backoff, 403/404/429/5xx failure records, JSON-LD/OG image extraction, and Radio Browser mapping.
- [ ] Run focused tests and verify they fail because the policy/adapters do not exist.
- [ ] Implement bounded HTTP requests with injected fetcher, no scraping bypasses, and source-specific parsers.
- [ ] Re-run focused tests and full suite.
- [ ] Commit `feat: add enrichment source adapters`.

### Task 3: Identity matching and normalization

**Files:**

- Create: `src/enrichment/identity.ts`
- Create: `src/enrichment/normalize.ts`
- Modify: `src/stations/types.ts` only for fields without existing equivalents.
- Test: `tests/enrichment/identity.test.ts`

**Interfaces:**

- `matchStation(reference, stations) -> Station | undefined`.
- `normalizeEnrichedData(raw) -> Partial<EnrichedStationData>`.
- `stateNameFor(code) -> string | undefined`.
- `normalizeCategories(values) -> string[]`.

- [ ] Write tests for UUID/URL/name+city+UF+frequency matching, name-only rejection, all 27 UFs, category deduplication, and city normalization.
- [ ] Run focused tests and verify the identity module is missing.
- [ ] Implement conservative matching and Portuguese state/category normalization without inventing values.
- [ ] Re-run focused tests and full suite.
- [ ] Commit `feat: normalize enriched station identity`.

### Task 4: Conflict resolution and catalog overlay

**Files:**

- Create: `src/enrichment/resolve.ts`
- Modify: `src/catalog/catalog.ts`
- Modify: `src/metadata/metadata.ts`
- Test: `tests/enrichment/resolve.test.ts`
- Test: `tests/metadata/metadata.test.ts`

**Interfaces:**

- `resolveEnrichment(existing, candidates) -> EnrichmentRecord`.
- `applyEnrichment(station, record) -> Station`.

- [ ] Write tests for priority `Radios.com.br > official > Radio Browser > public`, current official override, preservation of valid existing fields, and metadata display of state name/categories/slogan/logo.
- [ ] Run focused tests and verify the resolver is missing.
- [ ] Implement field-level conflict resolution and apply the optional overlay before previews/metadata.
- [ ] Re-run focused tests and full suite; verify stream fields and IDs are unchanged.
- [ ] Commit `feat: apply enriched metadata to catalog`.

### Task 5: Logo validation and curated asset provenance

**Files:**

- Create: `src/enrichment/logo.ts`
- Create: `data/enrichment/logo-sources.json`
- Modify: `assets/logos/stations/` only for validated user-provided or permitted images.
- Test: `tests/enrichment/logo.test.ts`

**Interfaces:**

- `validateLogo(response) -> ValidatedLogo | undefined`.
- `chooseLogo(existing, candidates) -> ValidatedLogo | undefined`.

- [ ] Write tests for content type, dimensions, invalid HTML, broken URLs, source priority and preserving a valid current logo.
- [ ] Run focused tests and verify the validator is missing.
- [ ] Implement image validation and provenance records; incorporate the two user-provided logos only after mapping them to stable station identities.
- [ ] Re-run focused tests and full suite.
- [ ] Commit `feat: validate station logos`.

### Task 6: Runner, idempotency and operational reporting

**Files:**

- Create: `src/enrichment/runner.ts`
- Create: `src/enrichment/report.ts`
- Create: `scripts/enrich-stations.ts`
- Modify: `package.json`
- Create: `tests/enrichment/runner.test.ts`
- Create: `docs/RADIO_BR_ENRICHMENT_REPORT.md`

**Interfaces:**

- `runEnrichment(options) -> Promise<EnrichmentRunReport>`.
- CLI command: `npm run enrich`.

- [ ] Write tests for continuing after one source failure, bounded concurrency, deterministic repeated output, preserved IDs/streams, and report contents.
- [ ] Run focused tests and verify the runner/command are missing.
- [ ] Implement the runner over the existing catalog/client, local snapshot output, structured report and safe exit status.
- [ ] Re-run all unit tests, build, lint, format check and browser tests.
- [ ] Commit `feat: add radio catalog enrichment runner`.

### Task 7: Final review and delivery

- [ ] Review the complete diff against the design and plan.
- [ ] Verify no generated credentials, external secrets or unlicensed logo files were added.
- [ ] Run `npm test -- --run`, `npm run build`, `npm run lint`, `npm run format:check` and `npm run test:ui`.
- [ ] Complete `docs/RADIO_BR_ENRICHMENT_REPORT.md` with actual results and limitations.
- [ ] Commit any final documentation-only adjustments.
