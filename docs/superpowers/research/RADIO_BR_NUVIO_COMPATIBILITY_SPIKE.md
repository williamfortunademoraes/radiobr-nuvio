# RADIO BR — Nuvio Compatibility Spike

## Status

Investigação controlada, sem implementação da Fase 2.

## Ambiente

- Addon investigado: RADIO BR 0.1.0.
- Commit: `f7ab963 feat: initial RADIO BR addon`.
- Branch: `main`.
- Nuvio Desktop: 1.1.35.
- Sistema: Windows x64.
- SDK: `stremio-addon-sdk` 1.6.10.
- Addon funcional: `http://127.0.0.1:7000/manifest.json`.
- Experimento isolado planejado: `http://127.0.0.1:7001/manifest.json`.

O estado inicial do Git não estava completamente limpo: o documento de design da Fase 2 `docs/superpowers/specs/2026-11-12-radio-br-catalog-v2-design.md` estava não commitado. Esse arquivo foi preservado e não foi sobrescrito. Nenhuma alteração funcional local foi modificada.

## Classificação utilizada

- **CONFIRMADO**: evidência observável suficiente.
- **NÃO CONFIRMADO**: há indícios, mas a evidência não é suficiente.
- **NÃO SUPORTADO**: teste reproduzível demonstrou incompatibilidade.
- **NÃO TESTADO**: etapa não executada ou bloqueada.

## Etapa A — Auditoria da Fase 1

### A.1 IDs e contratos atuais — CONFIRMADO

- Manifest ID: `com.williamfortuna.radio-br`.
- Versão: `0.1.0`.
- Tipo: `tv`.
- Catálogo atual: `radio-br-catalog`.
- Prefixo de estação: `radio-br:`.
- Recursos: `catalog`, `meta`, `stream`.
- Handlers: `defineCatalogHandler`, `defineMetaHandler`, `defineStreamHandler`.

### A.2 Estrutura efetiva do manifest — CONFIRMADO

O manifest atual declara:

```json
{
  "id": "com.williamfortuna.radio-br",
  "version": "0.1.0",
  "name": "RADIO BR",
  "resources": ["catalog", "meta", "stream"],
  "types": ["tv"],
  "catalogs": [
    {
      "type": "tv",
      "id": "radio-br-catalog",
      "name": "Rádios do Brasil",
      "extra": [{ "name": "search", "isRequired": false }]
    }
  ]
}
```

### A.3 Handler de catálogo — CONFIRMADO

`src/catalog/catalog.ts` aceita somente `type=tv` e `id=radio-br-catalog`. Ele chama `RadioBrowserClient.searchStations`, converte estações para Meta Preview Objects e retorna `{ metas }`.

O cliente Radio Browser usa `/json/stations/search` com `countrycode=BR`, `hidebroken=true`, `order=clickcount`, `reverse=true`, `limit` e `offset`.

### A.4 Extras `search` e `skip` — CONFIRMADO no contrato do addon / NÃO CONFIRMADO na UI desta investigação

- `extra.search` é encaminhado ao cliente como pesquisa por nome.
- `extra.skip` é convertido em `offset`.
- O teste automatizado verifica o encaminhamento de pesquisa e offset.
- Não foi executada uma busca manual no Nuvio nesta investigação.

### A.5 Meta Preview Objects — CONFIRMADO

O catálogo retorna objetos com:

```json
{
  "id": "radio-br:<stationuuid>",
  "type": "tv",
  "name": "Nome da estação",
  "poster": "https://...",
  "posterShape": "square"
}
```

`poster` é omitido quando não há favicon. A implementação não usa proxy de imagens.

### A.6 Streams — CONFIRMADO

O handler valida o prefixo e UUID, localiza a estação normalizada e prioriza `urlResolved`, usando `url` como fallback. Retorna URL direta em `{ streams: [{ url }] }`, sem proxy, retransmissão ou conversão.

### A.7 Cache — CONFIRMADO

`MemoryCache` usa TTL configurável e o cliente cria uma chave por pesquisa, offset e limite. O fetcher e o cache podem ser injetados nos testes.

### A.8 Testes existentes — CONFIRMADO

Resultados registrados antes da investigação:

- 7 arquivos de teste.
- 10 testes aprovados.
- `npm test -- --run`: aprovado.
- `npm run build`: aprovado.
- `npm run lint`: aprovado.
- `npm run format:check`: aprovado.

Os testes existentes não foram removidos nem modificados.

## Etapa B — Múltiplos catálogos

### Preparação

Foi preparado conceitualmente um manifest isolado, fora do addon funcional, com quatro catálogos `tv`:

- Brasil.
- Destaques.
- Notícias.
- Música.

O experimento usaria identificador separado `com.williamfortuna.radio-br-spike`, versão `0.0.0-spike` e porta 7001. Ele não seria publicado nem usado para substituir o manifest funcional.

### Resultado — NÃO TESTADO

O servidor temporário em `127.0.0.1:7001` não permaneceu acessível para validação HTTP. Para evitar confundir a preparação com evidência, não foi instalado no Nuvio e nenhum resultado de interface foi declarado.

Não foi possível confirmar:

1. se os quatro catálogos aparecem;
2. se os nomes são apresentados;
3. se cada catálogo abre;
4. se os resultados correspondem ao catálogo;
5. se pesquisa e paginação funcionam por catálogo;
6. se a ordem dos catálogos é preservada.

### Referência do SDK — CONFIRMADO, mas não equivalente à UI do Nuvio

O SDK 1.6.10 aceita `manifest.catalogs` como array e usa `args.id` no handler. Isso confirma o contrato do addon, mas não confirma que a interface do Nuvio Desktop apresentará quatro catálogos de forma útil.

## Etapa C — Filtros

| Recurso             | SDK/addon                                                                               | Nuvio Desktop nesta investigação           | Classificação  |
| ------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ | -------------- |
| `search`            | Declarado e implementado                                                                | Busca manual não executada nesta etapa     | NÃO TESTADO    |
| `skip`              | Implementado como offset                                                                | Paginação manual não executada nesta etapa | NÃO TESTADO    |
| `genre`             | Documentado pelo SDK, não declarado no manifest atual                                   | Não testado                                | NÃO TESTADO    |
| opções de `genre`   | Permitidas pelo contrato `extra.options`                                                | Não testado                                | NÃO TESTADO    |
| `state` customizado | Não faz parte do manifest atual; protocolo permite extras, mas cliente não foi validado | Não testado                                | NÃO CONFIRMADO |
| UF vazia            | Sem implementação experimental                                                          | Não testado                                | NÃO TESTADO    |

Conclusão: a aceitação de um extra pelo SDK não foi tratada como suporte da interface do Nuvio.

## Etapa D — Investigação visual

### Evidência da Fase 1 — CONFIRMADO

No Nuvio Desktop 1.1.35, o catálogo RADIO BR exibiu nomes e logotipos reais. O player e a tela de detalhes apresentaram a imagem da estação em uma apresentação quadrada/contida observável para a estação testada.

### Casos adicionais — NÃO TESTADO

Não foram executados nesta investigação isolada:

- poster quadrado controlado;
- poster retangular controlado;
- estação sem favicon;
- favicon inválido;
- imagem com transparência;
- comparação de recorte e fundo entre casos.

`posterShape: 'square'` é aceito pelo contrato do Meta Preview Object do SDK, mas o controle efetivo de CSS, `object-fit`, fundo e fallback pertence ao Nuvio e permanece não confirmado para esses casos.

## Etapa E — Reprodução

### AAC/AAC+ — CONFIRMADO na Fase 1

A estação Rádio FM O Dia 99.7 FM foi aberta pelo catálogo RADIO BR no Nuvio Desktop 1.1.35 para Windows.

- Codec declarado pela Radio Browser: AAC+.
- Bitrate informado: 128 kbps.
- URL `url_resolved`: `https://wz7.servidoresbrasil.com:8274/stream`.
- Player: exibiu fonte RADIO BR, AAC, 2.0 e estado de reprodução.
- Áudio sem vídeo aparente: observado.
- Estabilidade: observada por aproximadamente 6:45 sem troca manual.
- Resultado: compatibilidade AAC/AAC+ aprovada para essa sessão e plataforma.

A sessão anterior interrompida por troca manual permanece inconclusiva; ela não foi classificada como falha técnica.

### MP3, OGG e HLS — NÃO TESTADO nesta investigação

Embora existam candidatos reais previamente identificados e headers HTTP tenham sido verificados, não foi feita reprodução manual desses formatos nesta etapa.

Resposta HTTP, redirect e `Content-Type` não são tratados como prova de reprodução.

## Logs e capturas disponíveis

- Saída dos comandos automatizados foi observada no terminal durante a auditoria.
- O Nuvio exibiu visualmente o addon RADIO BR instalado, catálogo, detalhes da estação e player AAC/AAC+.
- Não foram adicionados arquivos de captura ao repositório nesta investigação.
- Não foram coletados logs internos do Nuvio Desktop.

## Limitações

- O experimento de múltiplos catálogos não permaneceu acessível e não foi instalado.
- Filtros `genre` e `state` não foram exercitados na interface.
- A busca manual e paginação manual não foram repetidas nesta etapa.
- Casos visuais controlados não foram isolados.
- MP3, OGG e HLS não tiveram reprodução observada nesta etapa.
- Não foi avaliada outra plataforma além do Nuvio Desktop 1.1.35 no Windows.
- O documento de design da Fase 2 já existente estava não commitado e foi preservado.

## Conclusões técnicas

### CONFIRMADO

- A Fase 1 permanece íntegra no commit investigado.
- Manifest, catálogo atual, metadados, stream direto e cache estão cobertos pelos contratos e testes existentes.
- Os 10 testes, build, lint e formatação passaram.
- O Nuvio Desktop 1.1.35 instalou e exibiu o addon funcional RADIO BR.
- O catálogo TV e os metadados visuais básicos foram apresentados.
- AAC/AAC+ iniciou e permaneceu reproduzindo por aproximadamente 6:45 na sessão observada.

### NÃO CONFIRMADO

- Apresentação útil de múltiplos catálogos no Nuvio Desktop.
- Filtros customizados de estado.
- Opções de gênero na interface.
- Limite prático de catálogos/opções.
- Tratamento uniforme de imagens quadradas, retangulares, transparentes ou inválidas.

### NÃO SUPORTADO

Nenhum teste reproduzível desta investigação demonstrou incompatibilidade. O experimento de múltiplos catálogos não foi executado o suficiente para receber essa classificação.

### NÃO TESTADO

- Pesquisa manual no Nuvio.
- Paginação manual no Nuvio.
- `genre` e `state` na interface.
- MP3, OGG e HLS no player.
- Casos visuais controlados.

## Decisão para o próximo passo

Esta investigação ainda não autoriza um plano de implementação da Fase 2. Antes do plano, deve ser repetido o experimento isolado com um servidor temporário funcional e, idealmente, o teste manual de extras e múltiplos catálogos no Nuvio Desktop. O addon funcional da Fase 1 não deve ser alterado para realizar essa prova.
