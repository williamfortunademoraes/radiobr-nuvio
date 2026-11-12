# RADIO BR — Design técnico da Fase 1

## Intenção

Criar o addon independente **RADIO BR**, compatível com o protocolo de addons do Stremio e destinado ao consumo pelo Nuvio. O addon fornecerá catálogo, metadados e URLs diretas de transmissão de estações brasileiras obtidas dinamicamente do Radio Browser.

Esta fase prioriza uma fundação pequena e verificável: uma estação de prova percorre o fluxo completo de catálogo, metadados e stream, enquanto a reprodução real no Nuvio permanece uma validação externa documentada separadamente.

## Objetivos

- Expor manifest, catálogo, metadados e streams usando o SDK oficial do Stremio.
- Consultar exclusivamente estações com `countrycode=BR`.
- Normalizar e validar dados sem cadastrar estações manualmente.
- Usar identificadores estáveis derivados de `stationuuid`, com prefixo `radio-br:`.
- Implementar cache em memória com TTL configurável.
- Permitir injeção do cliente HTTP e do cache nos testes.
- Entregar testes automatizados sem chamadas externas.
- Documentar execução local, arquitetura, endpoints e compatibilidade.

## Não objetivos

- Criar frontend, painel administrativo ou banco de dados.
- Modificar o Nuvio.
- Hospedar, retransmitir, converter ou fazer proxy de áudio.
- Cadastrar rádios manualmente como fonte do catálogo.
- Declarar reprodução no Nuvio sem teste real e evidência registrada.
- Expandir a Fase 1 para recursos futuros antes do relatório.

## Restrições e decisões

- Nome exibido: `RADIO BR`.
- Identificador do addon: `com.williamfortuna.radio-br`.
- Versão inicial: `0.1.0`.
- Tipo de conteúdo: `tv`.
- Catálogo: `radio-br-catalog`, com nome `Rádios do Brasil`.
- Recursos: `catalog`, `meta`, `stream`.
- API principal: `/json/stations/search`, sempre com `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` e `offset`.
- User-Agent descritivo configurável.
- Estação indisponível é descartada quando `lastcheckok` explicitamente indica falha ou quando não há URL de reprodução válida.
- `url_resolved` tem prioridade; `url` é fallback quando a primeira não existe.
- Ausência de dados não será preenchida por inferência.

## Abordagens consideradas

### 1. Módulos separados com dependências injetáveis — escolhida

`radio-browser` encapsula HTTP, parâmetros e cache. `stations` normaliza e valida. `catalog`, `metadata` e `streams` fazem apenas suas transformações e recebem dependências por composição. O addon conecta os handlers do SDK.

Vantagens: baixo acoplamento, testes determinísticos, responsabilidades alinhadas ao escopo e menor risco de dependência circular.

### 2. Serviço agregado único

Um serviço central faria busca, normalização, catálogo, metadados e streams.

Foi rejeitada porque mistura contratos diferentes, dificulta testes isolados e torna erros de API/cache mais difíceis de localizar.

## Arquitetura proposta

```text
src/
├── addon/          composição e handlers do SDK
├── catalog/        catálogo e pesquisa
├── config/         ambiente, constantes e opções
├── metadata/       conversão de estação para MetaPreview
├── radio-browser/  cliente HTTP, endpoint e cache
├── stations/       tipos, normalização e validação
└── streams/        validação de ID e StreamPreview
```

O fluxo principal será:

```text
Stremio/Nuvio
  -> addon handler
  -> catalog | metadata | streams
  -> radio-browser client
  -> cache TTL
  -> Radio Browser API
```

O handler de catálogo aceitará `extra.search` para pesquisa por nome. A primeira entrega usará a mesma busca normalizada, com paginação limitada e cache por combinação de busca/offset/limite.

## Contratos externos

O manifest terá `id`, `version`, `name`, `description`, `resources`, `types`, `catalogs` e `behaviorHints`. Os handlers retornarão objetos compatíveis com o SDK oficial:

- catálogo: itens com `id`, `type`, `name`, `poster` opcional;
- metadados: `meta` com nome, poster, descrição e campos disponíveis;
- stream: lista de `streams` com `url` direta e campos opcionais de qualidade/formato.

Os detalhes exatos de tipos serão confirmados pela versão instalada do SDK durante o plano de implementação, sem criar adaptadores proprietários desnecessários.

## Estação de prova

Será usada uma estação obtida de fixture/mock do Radio Browser, não uma estação codificada como fonte de produção. O fixture terá campos suficientes para demonstrar:

- ID estável;
- nome, favicon, homepage, estado, idioma e tags;
- codec, bitrate e `hls`;
- `url_resolved` e fallback `url`;
- filtragem de registro brasileiro e indisponível.

Isso prova o fluxo de dados sem alegar que a URL está reproduzindo no Nuvio.

## Cache e erros

O cache será uma abstração em memória com TTL por chave. O cliente Radio Browser receberá `fetch` e cache por parâmetro. Respostas HTTP não-OK, JSON inválido, timeout e falhas de rede produzirão erros tipados ou mensagens estáveis para os testes. O addon não substituirá erro de API por catálogo inventado.

## Testes

Testes Vitest cobrirão normalização, filtro brasileiro, descarte de indisponíveis, IDs, catálogo, pesquisa, metadados, streams, cache e falhas da API. Todos usarão fixtures e mocks locais.

O teste real de compatibilidade será um documento separado em `docs/compatibility-report.md`, com campos para plataforma, formato, URL testada, duração, resultado e evidência. Na primeira entrega ele distinguirá claramente o que foi executado do que permanece pendente.

## Entregáveis da Fase 1

- Projeto TypeScript executável localmente.
- Manifest e handlers funcionais.
- Cliente Radio Browser com cache.
- Fixture de estação de prova.
- Suíte automatizada sem dependência externa.
- README em português, `.env.example`, arquitetura, endpoints e relatório de compatibilidade.
- Comandos de validação do manifest e execução do addon.

## Chamadas de implementação

- Usar `fetch` nativo do Node para evitar dependência HTTP adicional.
- Usar `tsx` apenas para execução local, se necessário; o build será TypeScript compilado.
- Fixar versões estáveis no `package.json` no momento da implementação.
- Não fazer chamadas reais à API nos testes automatizados.
- Não marcar a compatibilidade com Nuvio como comprovada sem executar o teste manual e registrar evidências.
