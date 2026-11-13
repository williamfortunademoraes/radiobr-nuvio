# 🇧🇷 RADIO BR

Addon independente para **Stremio** e **Nuvio** que transforma o diretório público [Radio Browser](https://www.radio-browser.info/) em uma experiência de rádio brasileira.

Descubra estações, filtre por gênero ou estado, consulte metadados e reproduza os streams públicos cadastrados pelas emissoras — tudo em um catálogo dinâmico.

> **Status atual:** catálogo, destaques, gêneros e central de personalização implementados localmente. A reprodução AAC/AAC+ foi observada no Nuvio Desktop 1.1.35 para Windows. MP3, OGG, HLS e outras plataformas ainda aguardam validação manual.

## O que está incluído

- Catálogos de rádios em destaque, rádios por gênero e rádios do Brasil.
- Pesquisa, metadados e streams pelo protocolo de addons do Stremio.
- Classificação por gênero baseada apenas nas tags reais da Radio Browser, com aliases explícitos.
- IDs estáveis derivados de `stationuuid`.
- Cache em memória com TTL configurável e consulta compartilhada entre catálogos.
- Página inicial e central de personalização em cinco etapas.
- URLs de áudio diretas, sem proxy, retransmissão ou conversão.

Não há conta, banco de dados ou painel administrativo. A personalização gera uma URL compacta e um manifesto próprio para as escolhas de cada usuário.

## Começar localmente

```bash
npm install
copy .env.example .env
npm run dev
```

Depois, abra:

- `http://localhost:7000/` — página inicial;
- `http://localhost:7000/personalizar` — central de personalização;
- `http://localhost:7000/manifest.json` — manifesto padrão para instalar no Stremio ou Nuvio.

Para testar sem substituir uma instalação existente do Nuvio, use outra porta e um perfil separado:

```powershell
$env:PORT='7002'
npm run dev
```

Instale `http://127.0.0.1:7002/manifest.json` nesse perfil e abra o catálogo **Rádios por gênero**.

## Verificar o projeto

```bash
npm test
npm run build
npm run lint
npm run format:check
npm run test:ui
```

Os testes do serviço usam fixtures determinísticas e não chamam a Radio Browser. Os testes de interface usam o Chrome instalado e o build de produção em uma porta isolada.

## Configuração

As variáveis estão documentadas em [.env.example](.env.example):

| Variável                     | Finalidade                                       |
| ---------------------------- | ------------------------------------------------ |
| `RADIO_BROWSER_BASE_URL`     | Servidor da API Radio Browser.                   |
| `RADIO_BROWSER_USER_AGENT`   | User-Agent enviado nas consultas.                |
| `RADIO_BROWSER_CACHE_TTL_MS` | Tempo de vida do cache em memória.               |
| `PORT`                       | Porta HTTP local ou definida pelo provedor.      |
| `ADDON_BASE_URL`             | Origem pública usada no manifesto e nas imagens. |

Se `ADDON_BASE_URL` não for definida, o addon usa `http://127.0.0.1:PORT`.

## Publicar no Render

No serviço existente, use:

```text
Build:  npm ci && npm run build
Start:  npm start
```

Defina `ADDON_BASE_URL` com a URL pública HTTPS. Mantenha a pasta `assets/` junto do build e execute a aplicação a partir da raiz do projeto. Não é necessário criar outro serviço ou banco de dados.

Após publicar, verifique `/`, `/personalizar` e `/manifest.json`. Para detalhes sobre a central, consulte o [relatório de personalização](docs/PERSONALIZATION_REPORT.md).

## Compatibilidade

O [relatório de compatibilidade com o Nuvio](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md) separa o que foi observado no cliente das verificações HTTP e dos testes automatizados. A compatibilidade geral ainda não é declarada.

## Documentação

- [Arquitetura](docs/architecture.md)
- [Endpoints](docs/endpoints.md)
- [Rádios em destaque](docs/RADIOS_EM_DESTAQUE.md)
- [Relatório de compatibilidade](docs/NUVIO_COMPATIBILITY_TEST_REPORT.md)
- [Relatório da central de personalização](docs/PERSONALIZATION_REPORT.md)
- [Fase 2.1](docs/PHASE_2_1.md)
- [Fase 2.2 — gêneros](docs/PHASE_2_2.md)
- [Evolução futura do catálogo](docs/RADIO_BR_CATALOG_EVOLUTION.md)

## Licença e fonte dos dados

O addon utiliza dados públicos do [Radio Browser](https://www.radio-browser.info/). Nomes, logotipos, páginas e URLs de transmissão pertencem às respectivas emissoras e provedores.
