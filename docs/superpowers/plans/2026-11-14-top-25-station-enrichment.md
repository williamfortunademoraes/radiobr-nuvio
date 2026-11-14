# Top 25 Station Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enrich the 25 existing featured radios with verified slogan, official website, Radios.com.br URL, and Portuguese “Sobre” text without changing station IDs or streams.

**Architecture:** Add the two URLs to the existing enrichment data model and overlay pipeline. Keep editorial facts in a versioned map keyed by the current top-25 identity, then expose the resolved official website through station metadata while preserving the existing description order.

**Tech Stack:** TypeScript, Vitest, existing enrichment snapshot/resolution modules, Stremio/Nuvio metadata contract.

**Spec:** `docs/superpowers/specs/2026-11-14-top-25-station-enrichment-design.md`

## Global Constraints

- Do not change `stationUuid`, `id`, `url`, `urlResolved`, codec, bitrate, or playback behavior.
- Official website is the primary public website; Radios.com.br remains a separate secondary source.
- Preserve `slogan` and render it before frequency information.
- Render `about` as `Sobre:` and retain existing fallbacks for missing values.
- Do not add positions 26–100 in this change.

## Review Focus

- A station with an official URL must publish that URL in metadata; test in metadata coverage.
- A station with both homepage and curated website must prefer the curated official website; test in overlay resolution.
- Missing optional enrichment must not erase Radio Browser values; test in resolution coverage.
- Editorial text must not displace slogan/frequency/location ordering; test in description coverage.
- The 25-entry map must match every current ranking position exactly; test map completeness.

### Task 1: Extend enrichment contracts and overlay

**Files:**

- Modify: `src/enrichment/types.ts`
- Modify: `src/enrichment/normalize.ts`
- Modify: `src/enrichment/resolve.ts`
- Test: `tests/enrichment/resolve.test.ts`

**Interfaces:**

- Add optional `website?: string` and `radiosComBrUrl?: string` to `EnrichmentField` and `EnrichedStationData`.
- `applyEnrichment(station, record)` must return the same `Station` plus `homepage` from `website` when present.

- [ ] Write tests proving URL fields survive normalization/merge, curated `website` becomes station `homepage`, and missing URLs preserve the original homepage.
- [ ] Run `npx vitest run tests/enrichment/resolve.test.ts` and verify the new tests fail before implementation.
- [ ] Implement the two fields and overlay behavior using the existing normalization conventions.
- [ ] Run the focused test again and verify it passes.

### Task 2: Add the curated top-25 editorial map

**Files:**

- Create: `src/editorial/top-25-enrichment.ts`
- Modify: `src/editorial/top-25-ranking.ts` only if an exact source URL needs correction
- Test: `tests/editorial/top-25-enrichment.test.ts`

**Interfaces:**

- Export `top25Enrichment`, keyed by ranking position, with `slogan`, `website`, `radiosComBrUrl`, `about`, and per-field source metadata.
- Export `getTop25Enrichment(position: number)` returning the record or `undefined`.

- [ ] Write a completeness test asserting exactly 25 entries, positions 1–25, non-empty official website and Radios.com.br URL for every entry, and non-empty slogan/about text.
- [ ] Run the focused test and verify it fails because the map does not exist.
- [ ] Populate the map from verified official pages and preserve the current ranking URLs; use concise original “Sobre” copy derived from the requested `notes` semantics.
- [ ] Implement the lookup helper and run the focused test to verify it passes.

### Task 3: Integrate editorial enrichment into metadata

**Files:**

- Modify: `src/editorial/radios-em-destaque.ts`
- Modify: `src/editorial/resolve.ts` or the smallest existing editorial integration point
- Modify: `src/metadata/metadata.ts`
- Test: `tests/metadata/metadata.test.ts`

**Interfaces:**

- Featured/editorial station resolution must apply the position-specific enrichment before metadata generation.
- `stationMeta` must expose `website` from the resolved official homepage.

- [ ] Add tests asserting the official website is returned, slogan precedes frequency, and `Sobre:` contains the curated text.
- [ ] Run the focused metadata tests and verify failure.
- [ ] Integrate the map without changing editorial IDs, station matching, or stream fields.
- [ ] Run the focused tests and verify pass.

### Task 4: End-to-end verification and documentation

**Files:**

- Modify: `docs/RADIO_BR_ENRICHMENT_REPORT.md`
- Test: `tests/editorial/top-25-enrichment.test.ts`, `tests/enrichment/resolve.test.ts`, `tests/metadata/metadata.test.ts`

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run format:check`.
- [ ] Update the enrichment report with the new fields, the 25-radio scope, and the source/fallback behavior.
- [ ] Re-run all verification commands after the documentation update.
