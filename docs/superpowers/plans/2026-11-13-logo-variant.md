# Logo Variant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar a logo curada da FM O Dia quando a fonte entregar a variação de nome sem o prefixo `Rádio`.

**Architecture:** A consulta do mapa de logos em `catalog.ts` passará por uma normalização interna, sem modificar o nome público do card. O fallback existente permanece inalterado.

**Tech Stack:** TypeScript, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-logo-variant-design.md`

## Global Constraints

- Preservar a prioridade: logo curada, favicon, pôster padrão.
- Não alterar nomes exibidos, streams ou filtros.

## Review Focus

- Uma estação sem logo curada deve continuar usando seu favicon ou pôster padrão.
- Uma variação de caixa/acento deve resolver a mesma logo curada.

### Task 1: Resolução normalizada de logos curadas

**Files:**
- Modify: `src/catalog/catalog.ts`
- Test: `tests/catalog/catalog.test.ts`

- [ ] **Step 1: Write the failing test** para a estação `FM O DIA 100.5` esperando o pôster local `fm-o-dia-100-5.png`.
- [ ] **Step 2: Run the teste isolado** e confirmar que falha por retornar o fallback.
- [ ] **Step 3: Implementar a consulta normalizada** no resolvedor de logos curadas, removendo apenas o prefixo opcional `Rádio` e tornando caixa/acentos equivalentes.
- [ ] **Step 4: Run the teste isolado** e confirmar que passa.
- [ ] **Step 5: Run `npm test`, `npm run lint` e `npm run build`** para verificar regressões.
