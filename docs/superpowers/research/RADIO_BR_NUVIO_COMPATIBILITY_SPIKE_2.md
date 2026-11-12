# RADIO BR — Compatibility Spike 2

## 1. Contexto

Esta investigação avalia os contratos necessários para uma futura evolução do catálogo RADIO BR, sem iniciar a implementação da Fase 2. A Fase 1 permanece a referência funcional.

## 2. Ambiente e preservação

- Projeto: `williamfortunademoraes/radiobr-nuvio`.
- Branch: `main`.
- Commit investigado: `f7ab963 feat: initial RADIO BR addon`.
- Addon: RADIO BR `0.1.0`.
- SDK: `stremio-addon-sdk` `1.6.10`.
- Cliente de referência: Nuvio Desktop `1.1.35` para Windows.
- Manifest funcional: `com.williamfortuna.radio-br`.

Antes da auditoria, o Git estava na branch `main`, no commit `f7ab963`. Havia duas alterações locais não commitadas, ambas documentais e preservadas:

- `docs/superpowers/specs/2026-11-12-radio-br-catalog-v2-design.md`;
- `docs/superpowers/research/RADIO_BR_NUVIO_COMPATIBILITY_SPIKE.md`.

Nenhum arquivo funcional, dependência, teste existente, versão, ID, handler ou manifest publicado foi alterado.

## 3. Auditoria da Fase 1

### Resultado automatizado — CONFIRMADO

Os comandos foram executados sem alterações corretivas:

- `npm test -- --run`: 7 arquivos, 10 testes aprovados.
- `npm run build`: aprovado.
- `npm run lint`: aprovado.
- `npm run format:check`: aprovado.

### Contratos atuais — CONFIRMADO

- ID: `com.williamfortuna.radio-br`.
- Versão: `0.1.0`.
- Tipo: `tv`.
- Recursos: `catalog`, `meta`, `stream`.
- Catálogo atual: `radio-br-catalog` / `Rádios do Brasil`.
- Pesquisa: `extra.search`.
- Paginação interna: `extra.skip` convertido em `offset`.
- IDs de estação: `radio-br:<stationuuid>`.
- Stream: `urlResolved` antes de `url`, sem proxy.
- Cache: memória com TTL e chave por pesquisa, offset e limite.

### Meta Preview atual — CONFIRMADO

```json
{
  "id": "radio-br:<stationuuid>",
  "type": "tv",
  "name": "Nome da estação",
  "poster": "https://...",
  "posterShape": "square"
}
```

O poster é omitido sem favicon. O código não usa proxy de imagens.

## 4. Ambiente experimental

### Objetivo

O experimento deveria usar um manifest separado, com ID próprio, porta própria e quatro catálogos controlados: Brasil, Destaques, Notícias e Música. O servidor deveria registrar `args.id`, `args.extra.search`, `args.extra.genre`, `args.extra.state` e `args.extra.skip`.

### Resultado — NÃO TESTADO

Foi tentada a preparação de um servidor temporário em `127.0.0.1:7001`, separado da porta funcional `7000`. O processo não permaneceu acessível para validação HTTP durante a sessão. Por isso:

- o manifest experimental não foi instalado no Nuvio;
- nenhum catálogo experimental foi apresentado ao usuário;
- nenhum parâmetro recebido pelo Nuvio foi registrado;
- não houve alteração no addon funcional.

O primeiro spike e este segundo spike convergem no mesmo bloqueio: ainda falta um ambiente experimental persistente e reproduzível. A hipótese de múltiplos catálogos não deve ser classificada como confirmada.

### Procedimento recomendado para um próximo experimento

O servidor experimental deverá ser iniciado como processo independente, com:

- diretório e porta fora da aplicação funcional;
- log de requisições em arquivo temporário;
- endpoint `/manifest.json` verificável antes da instalação;
- endpoints de catálogo que respondam sem rede externa;
- comando explícito de encerramento;
- identificação dos argumentos recebidos por catálogo.

## 5. Investigação do SDK

### Múltiplos catálogos — CONFIRMADO no SDK / NÃO CONFIRMADO no Nuvio

O SDK 1.6.10 aceita múltiplos objetos em `manifest.catalogs`, cada um com `type`, `id`, `name` e `extra` opcional. O handler recebe `args.id` e pode selecionar a visão.

### Extras — CONFIRMADO no SDK / NÃO CONFIRMADO no Nuvio Desktop

O contrato documenta:

- `search`;
- `genre`;
- `skip`;
- `options` e `optionsLimit` em objetos `extra`.

O SDK permite representar `extra.genre` com opções. Não foi comprovado que o Nuvio Desktop 1.1.35 exiba ou envie `extra.state`, nem que mantenha seleção de filtros entre catálogos.

### Identidade visual do manifest — CONFIRMADO no SDK / NÃO CONFIRMADO no Nuvio Desktop

A documentação do SDK 1.6.10 aceita:

- `logo`: URL para PNG monocromático, recomendação de 256×256;
- `background`: URL para PNG/JPG, recomendação mínima de 1024×786;
- `name` e `description` para apresentação do addon.

Esses campos são aceitos pelo contrato do manifest. Não houve teste visual isolado no Nuvio Desktop para confirmar local, recorte, fallback, cache, proporção ou comportamento de URL inválida.

## 6. Radio Browser e ranking

Foi consultado um lote real com:

```text
countrycode=BR
hidebroken=true
order=clickcount
reverse=true
limit=100
offset=0
```

User-Agent: `RADIO-BR-spike-2/0.1.0`.

Resultado do lote observado:

| Campo                   | Quantidade de 100 |
| ----------------------- | ----------------: |
| `clickcount` presente   |               100 |
| `state` presente        |                75 |
| `tags` presente         |                85 |
| `favicon` presente      |                72 |
| `url_resolved` presente |               100 |

Codecs predominantes no lote:

| Codec   | Quantidade |
| ------- | ---------: |
| AAC+    |         44 |
| MP3     |         32 |
| AAC     |         21 |
| UNKNOWN |          2 |
| FLV     |          1 |

### Estratégia recomendada — CONFIRMADO como proposta, não como implementação

O ranking futuro deve:

1. Excluir país diferente de BR, UUID ausente, falha explícita, URL ausente e duplicatas.
2. Ordenar por `clickcount` descendente.
3. Priorizar `lastcheckok` explicitamente positivo sobre ausência.
4. Pontuar completude de nome, favicon, homepage, estado, idioma, tags e codec/bitrate.
5. Preferir `url_resolved` quando a fonte fornecer também `url`.
6. Usar `stationuuid` ascendente como desempate estável.

`clickcount` é popularidade, não prova de reprodução. `lastcheckok` é um sinal da fonte, não garantia de áudio no Nuvio.

### Cache e consulta — RECOMENDAÇÃO

Uma consulta base cacheada deve alimentar destaque, gênero, estado e localização desconhecida. Não deve haver uma requisição por categoria.

Recomendação inicial para implementação futura:

- lote base de até 100 estações por página;
- cache compartilhado por consulta base e parâmetros de pesquisa/paginação;
- classificação e agrupamento em memória;
- TTL configurável preservado;
- pesquisa textual usando `name` na API quando houver termo;
- ranking recalculado quando o lote cacheado expirar;
- nova página somente quando `skip` solicitar paginação.

O tamanho final do lote e o TTL ainda exigem medição de custo e volume antes da implementação.

## 7. Catálogos e filtros

| Recurso                     | Resultado                                                      | Evidência                                          | Decisão                        |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------------- | ------------------------------ |
| Múltiplos catálogos         | NÃO TESTADO                                                    | Ambiente experimental não permaneceu acessível     | Pendente                       |
| `extra.genre`               | CONFIRMADO no SDK; NÃO TESTADO no Nuvio                        | Documentação do SDK, sem requisição observada      | Pendente                       |
| `extra.state`               | NÃO CONFIRMADO                                                 | Não há teste de interface nem requisição observada | Pendente                       |
| Pesquisa                    | CONFIRMADO no addon atual; NÃO TESTADO manualmente nesta etapa | Testes automatizados e contrato atual              | Preservar e testar manualmente |
| Paginação                   | CONFIRMADO no addon atual; NÃO TESTADO manualmente nesta etapa | `skip`/offset em teste automatizado                | Preservar e testar manualmente |
| Catálogo vazio              | NÃO TESTADO no Nuvio                                           | Não houve ambiente experimental                    | Pendente                       |
| Ordem dos catálogos         | NÃO TESTADO                                                    | Nenhum manifest experimental instalado             | Pendente                       |
| Limite prático de catálogos | NÃO TESTADO                                                    | Sem observação no Nuvio                            | Pendente                       |

## 8. Identidade visual

### Nome e descrição — PROPOSTA

Nome de apresentação desejado:

**Estações de rádios - Brasil**

Descrição proposta, sem afirmar recursos ainda não implementados:

> Estações de rádios brasileiras reunidas em um catálogo dinâmico, com pesquisa de emissoras, informações individuais e reprodução de streams diretos. A organização por categorias, gêneros e estados depende dos dados disponíveis e da compatibilidade do cliente Nuvio.

O ID técnico permanece `com.williamfortuna.radio-br`. Não foi alterado.

### Logo — NÃO TESTADO visualmente

O SDK permite `logo` como URL pública de PNG monocromático, com recomendação de 256×256. A proposta de identidade deve remeter a rádio, frequências, emissoras brasileiras, música, informação, tecnologia e transmissão, sem copiar Stremio ou Nuvio.

Não foram criados ou substituídos assets nesta etapa. Ainda é necessário aprovar o asset e testar URL pública estável, carregamento, proporção e fallback no Nuvio Desktop.

### Background — NÃO TESTADO visualmente

O SDK permite `background` como URL pública de PNG/JPG, com recomendação mínima de 1024×786. Não foi confirmado se o Nuvio Desktop usa o campo na tela de detalhes do addon, na home, como banner ou somente em clientes específicos.

Não é correto afirmar que `background` controla a tela inicial. O comportamento do Nuvio Web também não substitui a prova no Desktop.

### Resultado visual geral

| Recurso                                     | Resultado                                       | Evidência                                     |
| ------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Nome atual RADIO BR                         | CONFIRMADO                                      | Exibido na instalação da Fase 1               |
| Nome desejado “Estações de rádios - Brasil” | NÃO TESTADO                                     | Não alterado no manifest                      |
| `logo`                                      | CONFIRMADO no SDK / NÃO TESTADO no Nuvio        | Contrato documentado, sem asset experimental  |
| `background`                                | CONFIRMADO no SDK / NÃO TESTADO no Nuvio        | Contrato documentado, sem asset experimental  |
| Poster quadrado                             | CONFIRMADO no contrato / parcialmente observado | `posterShape: square` e estação real anterior |
| Fallback, transparência, imagem quebrada    | NÃO TESTADO                                     | Sem experimento isolado                       |

## 9. Descrições individuais e metadados

### Campos confiáveis disponíveis

Quando presentes na Radio Browser, são candidatos confiáveis:

- `name`;
- `favicon`;
- `homepage`;
- `countrycode`;
- `state`;
- `language`;
- `tags`;
- `codec`;
- `bitrate`;
- `hls`;
- `url_resolved`/`url`.

### Estratégia proposta

Montar a descrição somente com blocos que tenham dados:

```text
<descrição textual existente, se houver>

Informações da estação
Gênero: <tags classificadas, se houver>
Localização: <state normalizado, se houver>
Idioma: <language, se houver>
Transmissão: <codec, se houver>
Bitrate: <bitrate, se houver>
Site oficial: <homepage, se houver>
```

Não haverá descrição editorial inventada. Tags permanecerão dados de fonte, com classificação separada. Estado e gênero não serão inferidos pelo nome, domínio ou homepage.

### Contrato Meta Object

O SDK documenta `name`, `description`, `poster`, `posterShape`, `background` e `website` entre os campos de metadados. A implementação futura deverá manter os campos suportados, omitir valores vazios e não adicionar propriedades arbitrárias sem confirmação do contrato.

O ID atual `radio-br:<stationuuid>` será preservado.

Resultado: **CONFIRMADO como estratégia de contrato; NÃO TESTADO visualmente no Nuvio para todos os campos**.

## 10. Reprodução

### AAC/AAC+ — CONFIRMADO anteriormente

Rádio FM O Dia 99.7 FM iniciou no Nuvio Desktop 1.1.35 para Windows, sem vídeo aparente, e permaneceu em reprodução por aproximadamente 6:45 sem troca manual.

Essa evidência deve ser preservada como regressão.

### MP3, OGG e HLS — NÃO TESTADO nesta Spike 2

Não houve nova reprodução manual desses formatos nesta etapa. Headers HTTP ou redirects não serão considerados evidência de compatibilidade de reprodução.

## 11. Matriz de compatibilidade

| Recurso                | Resultado                                                      | Evidência                          | Decisão                           |
| ---------------------- | -------------------------------------------------------------- | ---------------------------------- | --------------------------------- |
| Múltiplos catálogos    | NÃO TESTADO                                                    | Servidor experimental instável     | Pendente                          |
| Extra genre            | NÃO TESTADO                                                    | SDK aceita; Nuvio não observado    | Pendente                          |
| Extra state            | NÃO CONFIRMADO                                                 | Sem teste de interface             | Pendente                          |
| Pesquisa               | CONFIRMADO no addon / NÃO TESTADO no Nuvio nesta Spike 2       | Testes e contrato atuais           | Preservar; repetir manualmente    |
| Paginação              | CONFIRMADO no addon / NÃO TESTADO no Nuvio nesta Spike 2       | Testes e contrato atuais           | Preservar; repetir manualmente    |
| Manifest background    | CONFIRMADO no SDK / NÃO TESTADO no Nuvio                       | Documentação sem teste visual      | Pendente                          |
| Manifest logo          | CONFIRMADO no SDK / NÃO TESTADO no Nuvio                       | Documentação sem asset             | Pendente                          |
| Descrições individuais | CONFIRMADO como estratégia de campos / NÃO TESTADO visualmente | Campos Radio Browser e Meta Object | Pendente                          |
| Poster quadrado        | CONFIRMADO no contrato; parcialmente observado                 | `posterShape: square`              | Preservar e testar casos extremos |
| AAC/AAC+               | CONFIRMADO anteriormente                                       | Reprodução observada por ~6:45     | Preservar                         |
| MP3                    | NÃO TESTADO                                                    | Sem reprodução nesta Spike 2       | Pendente                          |
| OGG                    | NÃO TESTADO                                                    | Sem reprodução nesta Spike 2       | Pendente                          |
| HLS                    | NÃO TESTADO                                                    | Sem reprodução nesta Spike 2       | Pendente                          |

## 12. Evidências disponíveis

- Estado Git, branch e commit registrados.
- Saída dos quatro comandos de regressão registrada na sessão.
- Documentos técnicos anteriores preservados.
- Contratos do SDK 1.6.10 consultados localmente.
- Lote real da Radio Browser consultado com User-Agent descritivo.
- Nuvio Desktop 1.1.35 previamente observado com RADIO BR instalado e AAC/AAC+ reproduzindo.

Não foram adicionadas capturas de tela ao repositório. Não foram coletados logs internos do Nuvio Desktop.

## 13. Limitações e pendências

- O ambiente experimental estável ainda precisa ser resolvido.
- Múltiplos catálogos não foram instalados no Nuvio.
- `genre` e `state` não foram enviados/observados na interface.
- Pesquisa e paginação não foram repetidas manualmente nesta Spike 2.
- `logo` e `background` não foram testados visualmente no Nuvio Desktop.
- Fallback, transparência, imagens inválidas e posters retangulares não foram isolados.
- MP3, OGG e HLS não foram reproduzidos nesta etapa.
- O comportamento do Nuvio Web não foi usado como prova do Desktop.

## 14. Decisões recomendadas

1. Preservar `com.williamfortuna.radio-br`, `0.1.0`, `tv`, `radio-br-catalog`, IDs de estação e handlers atuais.
2. Resolver o servidor experimental persistente antes de qualquer alteração de manifest.
3. Testar primeiro quatro catálogos controlados; só depois avaliar gêneros, estados e localização desconhecida.
4. Preferir `extra.genre` por ser documentado pelo SDK, mas exigir prova no Nuvio.
5. Não depender de `extra.state` sem observar o envio real; considerar catálogos estaduais somente após avaliar usabilidade.
6. Adicionar ranking e agrupamento como módulos puros, alimentados por uma consulta base cacheada.
7. Usar `logo` 256×256 e `background` 1024×786 somente após aprovar assets e testar URLs públicas no Nuvio.
8. Melhorar descrições apenas com campos presentes, sem inferência editorial.
9. Preservar `posterShape: square` e não criar proxy de imagens.
10. Repetir MP3, OGG e HLS no player antes de declarar compatibilidade adicional.

## 15. Parecer final

### A. Compatibilidade

Comprovados no Nuvio Desktop 1.1.35: instalação do addon funcional, catálogo TV, metadados visuais básicos, stream direto e reprodução AAC/AAC+ observada por aproximadamente 6:45. Os recursos de Fase 2 ainda não estão comprovados.

### B. Catálogos

A organização tecnicamente mais segura é manter o catálogo atual e adicionar visões graduais, começando por destaque e gênero. Estado deve permanecer pendente até provar `extra.state` ou a usabilidade de catálogos estaduais individuais.

### C. Identidade visual

`logo` e `background` são campos aceitos pelo SDK, com recomendações de 256×256 PNG monocromático e PNG/JPG de pelo menos 1024×786, respectivamente. A exibição no Nuvio Desktop ainda não foi comprovada.

### D. Metadados

Nome, favicon, homepage, estado, idioma, tags, codec, bitrate e HLS podem ser apresentados somente quando fornecidos pela Radio Browser. A descrição deve ser composta por blocos presentes, sem invenção.

### E. Imagens

O addon controla URL e `posterShape: square`; recorte, fundo, transparência, `object-fit`, fallback e tratamento de falha pertencem ao cliente e ainda não foram totalmente testados.

### F. Ranking

Recomenda-se ranking determinístico por `clickcount`, disponibilidade explícita, completude de metadados, URL resolvida e UUID como desempate, sempre distinguindo popularidade de reprodução real.

### G. Arquitetura

Os módulos futuros sugeridos são `stations/tags`, `stations/locations`, `catalog/ranking` e `catalog/grouping`, reutilizando cliente, cache, normalização e handlers existentes.

### H. Riscos

Persistem dúvidas sobre servidor experimental, múltiplos catálogos, filtros customizados, limite de opções, logo/background, casos visuais extremos e reprodução MP3/OGG/HLS.

### I. Recomendação

O design técnico ainda **não está pronto para virar plano de implementação**. É necessário concluir o spike isolado com servidor persistente e evidências do Nuvio Desktop para múltiplos catálogos, filtros e identidade visual.

## 16. Condição de encerramento

Esta Spike 2 fica encerrada como investigação parcial, com a Fase 1 preservada e sem código de produção alterado. Não houve commit, publicação de nova versão ou início da implementação da Fase 2.
