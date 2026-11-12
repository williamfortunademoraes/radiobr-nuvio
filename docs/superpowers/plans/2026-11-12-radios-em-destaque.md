# Rádios em Destaque Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar uma coleção editorial versionada de 13 rádios ao addon RADIO BR, preservando os contratos atuais e reutilizando o fluxo existente de catálogo, metadata e streams.

**Architecture:** Dados editoriais ficam em módulo TypeScript puro e ordenado. Um resolvedor relaciona esses registros às estações retornadas pelo Radio Browser, enquanto catálogo, metadata e streams continuam sendo os únicos pontos de protocolo. Itens sem correspondência ou stream validado permanecem visíveis como indisponíveis.

**Tech Stack:** TypeScript, Stremio Addon SDK, Vitest, ESLint, TypeScript compiler.

**Spec:** `docs/superpowers/specs/2026-11-12-radios-em-destaque-design.md`

## Global Constraints

- Preservar contratos, endpoints, IDs existentes, compatibilidade com Nuvio e integração com Radio Browser.
- Não criar frontend, painel administrativo, banco, proxy ou segundo sistema de reprodução.
- Não inventar frequências, localização, logos, websites ou streams ausentes.
- Streams só podem ser expostos para estações encontradas e URLs válidas pelo fluxo atual.
- A coleção editorial deve ser independente do ranking automático do Radio Browser.

## Review Focus

- Item editorial sem correspondência no Radio Browser: deve aparecer sem stream e sem ser fabricado.
- URL de página individual: deve ser website, nunca stream.
- Logo ausente ou quebrado: metadata deve usar fallback sem imagem inválida.
- Estação duplicada por aliases: deve ser representada uma única vez na coleção.
- Coleção desativada: catálogo deve retornar vazio sem alterar catálogos existentes.

### Task 1: Modelo e dados editoriais

**Files:**
- Create: `src/editorial/types.ts`
- Create: `src/editorial/radios-em-destaque.ts`
- Modify: `src/stations/types.ts`
- Test: `tests/editorial/radios-em-destaque.test.ts`

**Interfaces:**
- Produces `EditorialCollection`, `EditorialRadio`, `radiosEmDestaque` e `findEditorialRadioById`.
- `EditorialRadio` inclui ID estável, nome, category, logoUrl/logoSource, websiteUrl, frequency, city/state, sourceUrl, stationId opcional e streamUrl opcional.

- [ ] Escrever testes para 13 IDs, ordem manual, `enabled/showOnHome`, dados ausentes como `undefined` e ausência de URLs de página usadas como stream.
- [ ] Implementar os tipos e cadastrar somente valores confirmados na fonte Rádios Brasil, preservando referência por item.
- [ ] Adicionar campos opcionais não duplicativos ao modelo `Station` para apresentação/origem.
- [ ] Executar `npx vitest run tests/editorial/radios-em-destaque.test.ts` e confirmar PASS.

### Task 2: Resolução editorial sobre estações existentes

**Files:**
- Create: `src/editorial/resolve.ts`
- Test: `tests/editorial/resolve.test.ts`

**Interfaces:**
- Consumes `EditorialRadio` e `Station`.
- Produces `resolveEditorialStations(editorial, stations): ResolvedEditorialRadio[]`, com estação opcional e `playable` booleano.

- [ ] Testar match por `stationId`, fallback por nome normalizado, deduplicação e ausência de match.
- [ ] Implementar resolução sem criar estação sintética e considerando `urlResolved`/`url` somente quando válidos.
- [ ] Executar o teste unitário e confirmar PASS.

### Task 3: Catálogo, metadata e streams

**Files:**
- Modify: `src/catalog/catalog.ts`
- Modify: `src/metadata/metadata.ts`
- Modify: `src/streams/streams.ts`
- Modify: `src/addon/manifest.ts`
- Test: `tests/catalog/editorial.test.ts`
- Test: `tests/metadata/metadata.test.ts`
- Test: `tests/streams/streams.test.ts`

**Interfaces:**
- Mantém os handlers atuais e adiciona apenas o ID `radios-em-destaque`.
- Reutiliza `RadioBrowserClient.searchStations()` e a resolução editorial da Task 2.

- [ ] Adicionar testes para catálogo editorial ordenado, `enabled/showOnHome`, fallback visual e disponibilidade.
- [ ] Adicionar metadata com logo oficial quando disponível, website separado e indicação de indisponibilidade.
- [ ] Fazer stream editorial delegar ao mesmo critério de URL validada, retornando vazio para item sem estação/URL.
- [ ] Atualizar manifest sem remover IDs ou catálogos existentes.
- [ ] Executar testes direcionados e confirmar PASS.

### Task 4: Documentação e verificação final

**Files:**
- Modify: `README.md`
- Create: `docs/RADIOS_EM_DESTAQUE.md`

- [ ] Documentar estrutura, origem dos logos, atualização editorial, validação de streams e responsabilidade do Nuvio pela apresentação.
- [ ] Executar `npm test`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run build`.
- [ ] Revisar diff e confirmar que contratos atuais e testes existentes permanecem íntegros.
