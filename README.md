# 🇧🇷 RADIO BR

Addon independente para Stremio e Nuvio que transforma o diretório público Radio Browser em uma experiência de rádio brasileira, com catálogo dinâmico, metadados e streams diretos.

> **Status:** Fase 1 concluída · compatibilidade AAC/AAC+ observada no Nuvio Desktop 1.1.35 para Windows · MP3, OGG e HLS pendentes de reprodução manual.

## O que o RADIO BR faz

- Consulta estações brasileiras dinamicamente no Radio Browser.
- Expõe os catálogos Rádios em destaque e Rádios do Brasil, com pesquisa, metadados e streams pelo protocolo de addons do Stremio.
- Usa IDs estáveis derivados do `stationuuid`.
- Mantém cache em memória com expiração configurável.
- Entrega URLs diretas, sem proxy, retransmissão ou conversão de áudio.

O projeto não possui frontend, painel administrativo ou banco de dados.

## Executar localmente

```bash
npm install
copy .env.example .env
npm run dev
```

O manifest fica em `http://localhost:7000/manifest.json`. O addon não possui frontend, banco, proxy ou retransmissão de áudio.

## Validar

```bash
npm test
npm run build
npm run lint
npm run format:check
```

Os testes são determinísticos e usam fixture; não fazem chamadas à Radio Browser.

## Configuração

`RADIO_BROWSER_BASE_URL`, `RADIO_BROWSER_USER_AGENT`, `RADIO_BROWSER_CACHE_TTL_MS`, `PORT` e `ADDON_BASE_URL` estão descritos em `.env.example`. `ADDON_BASE_URL` define a origem pública usada nas imagens do manifest e, quando omitido, usa `http://127.0.0.1:PORT`.

## Compatibilidade

Consulte [docs/NUVIO_COMPATIBILITY_TEST_REPORT.md](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md) para ver a matriz real por formato e plataforma. A compatibilidade geral ainda não é declarada.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Endpoints](docs/endpoints.md)
- [Relatório de compatibilidade](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md)
- [Evolução futura do catálogo](docs/RADIO_BR_CATALOG_EVOLUTION.md)

## Licença e fonte de dados

O addon usa dados públicos do [Radio Browser](https://www.radio-browser.info/). As estações e URLs pertencem às respectivas emissoras e provedores.
