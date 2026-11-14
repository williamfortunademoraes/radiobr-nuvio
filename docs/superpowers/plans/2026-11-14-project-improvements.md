# RADIO BR Project Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corrigir o comportamento de personalização, tornar a qualidade do repositório verificável, reduzir riscos operacionais e melhorar a descoberta de rádios.

**Architecture:** Preservar o addon sem banco, proxy ou dependências de runtime novas. Ajustes de catálogo permanecem em `config`/`catalog`; robustez de fonte fica no cliente Radio Browser; saúde e apresentação ficam no servidor e nos assets existentes.

**Tech Stack:** TypeScript, Express, Stremio Addon SDK, Vitest, Playwright, ESLint, Prettier.

**Spec:** `docs/architecture.md`, `docs/endpoints.md`, `README.md` e as recomendações registradas na conversa.

## Global Constraints

- Preservar IDs de estação, URLs de stream e o contrato do addon.
- Não adicionar conta, banco de dados, proxy ou conversão de áudio.
- Manter Radio Browser como fonte de catálogo em runtime.
- Não inferir cidade, gênero ou identidade a partir de dados insuficientes.
- Toda mudança de comportamento deve ter teste automatizado antes da implementação.

## Review Focus

- Configuração com estados selecionados deve expor somente esses estados no manifesto; coberto em `tests/addon/personalization.test.ts` e no teste de navegador.
- Falha/lentidão da Radio Browser não deve deixar requisições ilimitadas; coberto em `tests/radio-browser/client.test.ts`.
- Health check deve refletir apenas disponibilidade do processo, sem consulta externa; coberto em `tests/addon/http.test.ts`.
- Favoritos locais devem continuar funcionando sem conta e sem quebrar a página; coberto em `tests/browser/wizard.spec.ts`.
- Lint e formatação não devem atravessar worktrees ou artefatos gerados; verificado pelos comandos do projeto.

### Task 1: Corrigir catálogo personalizado por estado

**Files:** `src/config/addon-config.ts`, `tests/addon/personalization.test.ts`, `tests/browser/wizard.spec.ts`.

- [x] Escrever teste que espera somente os estados selecionados.
- [x] Rodar o teste e confirmar falha.
- [x] Filtrar `STATES` por `config.s` quando a seleção não estiver vazia.
- [x] Rodar a suíte de catálogo/personalização e o E2E.

### Task 2: Tornar lint e formatação determinísticos

**Files:** `eslint.config.mjs`, `.prettierignore` e arquivos apontados pelo Prettier.

- [x] Ignorar `.worktrees/**`, `output/**` e `dist/**` em qualquer profundidade.
- [x] Formatar os arquivos divergentes.
- [x] Confirmar `lint` e `format:check` limpos.

### Task 3: Limitar e instrumentar a coleta agregada

**Files:** `src/config/index.ts`, `src/radio-browser/client.ts`, `tests/radio-browser/client.test.ts`, `README.md`.

- [x] Escrever teste para limite de páginas e falha explícita quando o limite é atingido.
- [x] Adicionar limite configurável e timeout de fetch sem alterar o contrato público.
- [x] Registrar métricas básicas via callback opcional, sem logar URLs sensíveis.
- [x] Atualizar configuração e documentação.

### Task 4: Adicionar health check e resposta operacional

**Files:** `src/server.ts`, `tests/addon/http.test.ts`, `docs/endpoints.md`, `README.md`.

- [x] Escrever teste para `GET /health` com JSON estável.
- [x] Implementar endpoint sem dependência da Radio Browser.
- [x] Documentar uso em deploy e monitoramento.

### Task 5: Melhorar descoberta e favoritos locais

**Files:** `src/web/pages.ts`, `assets/personalizar.js`, `assets/site.css`, `tests/browser/wizard.spec.ts`.

- [x] Escrever teste de renderização/fluxo da área de favoritos e busca.
- [x] Adicionar busca de estações na página própria e favoritos com `localStorage`.
- [x] Manter fallback quando `localStorage` ou autoplay não estiver disponível.
- [x] Validar mobile, teclado e ausência de erros de página.

### Task 6: Verificação final

- [x] Rodar `npm test`, `npm run build`, `npm run lint`, `npm run format:check` e `npm run test:ui`.
- [x] Revisar diff e status do Git.
- [x] Atualizar documentação com limitações reais restantes.
