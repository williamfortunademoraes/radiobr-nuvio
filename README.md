# 🇧🇷 RADIO BR

Addon independente para Stremio e Nuvio que transforma o diretório público Radio Browser em uma experiência de rádio brasileira, com catálogo dinâmico, metadados e streams diretos.

> **Status:** Fases 2.1 e 2.2 implementadas localmente · compatibilidade AAC/AAC+ observada no Nuvio Desktop 1.1.35 para Windows · navegação por gênero pendente de validação visual · MP3, OGG e HLS pendentes de reprodução manual.

## O que o RADIO BR faz

- Consulta estações brasileiras dinamicamente no Radio Browser.
- Expõe os catálogos Rádios em destaque, Rádios por gênero e Rádios do Brasil, com pesquisa, metadados e streams pelo protocolo de addons do Stremio.
- Classifica estações por gênero usando somente as tags reais da Radio Browser, com aliases explícitos e sem inferência por nome ou domínio.
- Usa IDs estáveis derivados do `stationuuid`.
- Mantém cache em memória com expiração configurável e reaproveita a mesma consulta entre os catálogos.
- Entrega URLs diretas, sem proxy, retransmissão ou conversão de áudio.

O addon inclui página própria e central de personalização em cinco etapas. Coleções, gêneros, estados e envio de logotipos ficam em uma URL compartilhável, sem conta ou banco de dados.

## Executar localmente

```bash
npm install
copy .env.example .env
npm run dev
```

A página fica em `http://localhost:7000/`, o configurador em `/personalizar` e o manifesto padrão em `/manifest.json`. A personalização gera `/:config/manifest.json` usando o formato nativo do SDK. O addon não faz proxy ou retransmissão de áudio.

Para testar em um perfil separado do Nuvio sem substituir a instalação existente:

```powershell
$env:PORT='7002'
npm run dev
```

Instale `http://127.0.0.1:7002/manifest.json` no perfil separado e abra o catálogo **Rádios por gênero**.

## Validar

```bash
npm test
npm run build
npm run lint
npm run format:check
npm run test:ui
```

Os testes do serviço usam fixtures, sem chamadas à Radio Browser. Os testes de interface usam Chrome instalado e o build de produção em uma porta isolada (7011).

## Publicação no Render

No serviço existente, use build `npm ci && npm run build`, start `npm start` (ou `node dist/src/index.js`) e `ADDON_BASE_URL=https://radiobr-nuvio.onrender.com`. O servidor usa `process.env.PORT`. Mantenha `assets/` junto do build e execute a partir da raiz do projeto. Não é necessário criar outro serviço ou banco.

Após o deploy, verifique `/`, `/personalizar`, `/manifest.json` e gere uma URL pela interface. A URL deve usar HTTPS e o domínio público. Consulte [o relatório da central](docs/PERSONALIZATION_REPORT.md) para limitações e validação experimental.

## Configuração

`RADIO_BROWSER_BASE_URL`, `RADIO_BROWSER_USER_AGENT`, `RADIO_BROWSER_CACHE_TTL_MS`, `PORT` e `ADDON_BASE_URL` estão descritos em `.env.example`. `ADDON_BASE_URL` define a origem pública usada nas imagens do manifest e, quando omitido, usa `http://127.0.0.1:PORT`.

## Compatibilidade

Consulte [docs/NUVIO_COMPATIBILITY_TEST_REPORT.md](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md) para ver a matriz real por formato e plataforma. A compatibilidade geral ainda não é declarada.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Endpoints](docs/endpoints.md)
- [Relatório de compatibilidade](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md)
- [Fase 2.1](docs/PHASE_2_1.md)
- [Fase 2.2 — gêneros](docs/PHASE_2_2.md)
- [Evolução futura do catálogo](docs/RADIO_BR_CATALOG_EVOLUTION.md)

## Licença e fonte de dados

O addon usa dados públicos do [Radio Browser](https://www.radio-browser.info/). As estações e URLs pertencem às respectivas emissoras e provedores.
