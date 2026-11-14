# Fusão de identidade de estações Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fundir registros duplicados da mesma emissora usando marca, frequência e localização compatíveis, mantendo o melhor logo.

**Architecture:** Extrair a normalização de identidade para um módulo puro e reutilizá-la no catálogo. O matching de logos usará a mesma normalização, com alias explícito apenas quando a identidade já for segura.

**Tech Stack:** TypeScript, Vitest, Node.js.

**Spec:** `docs/superpowers/specs/2026-11-14-station-identity-merge-design.md`

## Global Constraints

- Não fundir emissoras de cidades/UFs incompatíveis.
- Não alterar IDs ou URLs de stream do registro canônico.
- Usar testes antes do código de produção.

## Review Focus

- Acentos, prefixo Rádio e sufixos FM/AM não podem impedir a fusão.
- Frequências com ponto, vírgula ou sem sufixo devem ser equivalentes.
- Redes com a mesma marca em cidades diferentes devem permanecer separadas.
- Um registro sem logo próprio deve herdar o logo curado da identidade.
- Registros sem localização suficiente não devem ser fundidos por acidente.

### Task 1: Identidade normalizada e deduplicação

**Files:**

- Create: `src/catalog/identity.ts`
- Modify: `src/catalog/catalog.ts`
- Test: `tests/catalog/catalog.test.ts`

- [x] Escrever testes para Tupi com variação de acento/frequência, rede em cidades distintas e seleção do primeiro registro canônico.
- [x] Rodar os testes e confirmar falha.
- [x] Implementar `stationIdentity(station)` e `dedupeStations(stations)` com marca, frequência e localização compatíveis.
- [x] Rodar testes específicos e confirmar aprovação.

### Task 2: Logo por identidade

**Files:**

- Modify: `src/catalog/catalog.ts`
- Test: `tests/catalog/catalog.test.ts`

- [x] Escrever teste para `Super Radio Tupi 96.5` receber `tupi-96-5.png`.
- [x] Rodar o teste e confirmar falha.
- [x] Fazer o resolvedor de logo consultar o nome normalizado/identidade sem depender do texto editorial completo.
- [x] Rodar a suíte completa, build e lint.

### Task 3: Entrega

- [x] Revisar diff e documentação.
- [ ] Criar commit com mensagem descritiva.
- [ ] Fazer push para o branch remoto atual e confirmar o resultado.
