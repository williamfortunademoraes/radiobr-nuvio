# RADIO BR — Design técnico da evolução do catálogo

## Status

Documento de design e investigação. Nenhum código da Fase 1 foi alterado e nenhum plano de implementação foi criado.

## 1. Diagnóstico da arquitetura atual

O RADIO BR 0.1.0 possui uma composição simples e adequada para evolução incremental:

```text
RadioBrowserClient
  -> normalizeStation
  -> CatalogService
  -> MetaPreview / Meta / Stream
  -> AddonBuilder do stremio-addon-sdk 1.6.10
```

Responsabilidades atuais:

- `radio-browser`: consulta `/json/stations/search`, parâmetros brasileiros obrigatórios, User-Agent e cache TTL.
- `stations`: filtro de `countrycode=BR`, descarte de falhas explícitas/URLs ausentes, normalização de tags e ID `radio-br:<stationuuid>`.
- `catalog`: um catálogo `radio-br-catalog`, pesquisa por `extra.search`, paginação por `extra.skip` e previews `tv`.
- `metadata`: busca uma estação e monta nome, poster, descrição e homepage.
- `streams`: valida o ID e entrega `urlResolved` ou `url` diretamente.
- `addon`: registra os handlers oficiais `defineCatalogHandler`, `defineMetaHandler` e `defineStreamHandler`.

O cache atual é por combinação de busca, offset e limite. A consulta padrão é limitada a 100 itens e ordenada por `clickcount` descendente pela API. O modelo interno ainda não preserva `clickcount`, `lastcheckok`, `countrycode` bruto ou uma representação normalizada do estado suficiente para ranking e agrupamento. Esses campos deverão ser adicionados somente na implementação da Fase 2, mantendo os contratos existentes compatíveis.

## 2. Preservação da Fase 1

As seguintes propriedades são referências funcionais e não devem mudar sem regressão explícita:

- ID do addon: `com.williamfortuna.radio-br`.
- Versão atual: `0.1.0` até decisão de release posterior.
- Tipo: `tv`.
- Stream direto sem proxy, retransmissão ou conversão.
- IDs derivados de `stationuuid`.
- Fonte dinâmica Radio Browser, sem lista manual de estações.
- Compatibilidade observada no Nuvio Desktop 1.1.35 para Windows para catálogo e reprodução AAC/AAC+.
- Os 10 testes automatizados existentes devem continuar passando.

Não é objetivo desta fase de design substituir o tipo `tv`, alterar o fluxo de metadados/streams ou criar frontend.

## 3. Investigação dos contratos do SDK

### 3.1 Múltiplos catálogos

O SDK 1.6.10 aceita `manifest.catalogs` como array de objetos. Cada catálogo possui, no mínimo, `type`, `id` e `name`; pode declarar `extra` com objetos `{ name, isRequired, options, optionsLimit }`. O protocolo usa o `id` para formar `/catalog/{type}/{id}.json`, portanto cada catálogo precisa de um identificador estável.

O handler único recebe `args.id` e pode selecionar a visão correspondente sem duplicar o transporte. A proposta é preservar o handler existente e extrair um resolvedor de visão:

```text
catalog id + extra -> CatalogQuery -> Station[] -> MetaPreview[]
```

### 3.2 Filtros extras

O SDK documenta `search`, `genre` e `skip` como extras de catálogo. `genre` pode declarar opções fixas no manifest, e o handler recebe `args.extra.genre`. O protocolo também permite propriedades extras codificadas na rota, mas a aceitação e a apresentação de um extra arbitrário como `state` não foram comprovadas no Nuvio Desktop 1.1.35.

Decisão de design:

- gênero: candidato de primeira classe, usando `extra: [{ name: 'genre', options: [...] }]`;
- estado: não depender inicialmente de `extra.state` sem um teste no Nuvio; avaliar catálogo por estado ou extra customizado somente após uma prova de UI/protocolo;
- pesquisa: manter `search` em todas as visões que suportarem busca;
- paginação: manter `skip` em múltiplos de 100, como o protocolo espera.

### 3.3 Imagens e proporção quadrada

O Meta Preview Object documentado aceita `posterShape: 'square'` para imagens 1:1. O RADIO BR já envia essa propriedade quando há favicon. Isso controla a indicação de proporção no contrato, mas não controla o CSS, o recorte, o fundo ou o carregamento da imagem no cliente.

Não há autorização nem justificativa para proxy de imagens. O addon deve preservar a URL original, definir `posterShape: 'square'` e usar um fallback quadrado próprio somente quando houver uma estratégia de asset aprovada; não deve fabricar um logotipo da estação.

### 3.4 Limites de catálogos e opções

O SDK não impõe, no contrato consultado, um limite numérico para `manifest.catalogs` ou `extra.options`. Não há evidência suficiente de que o Nuvio Desktop tenha uma experiência adequada para 27 catálogos estaduais mais catálogos de gêneros.

Classificação: **pendente de prova**. Antes da implementação, deve ser feito um spike controlado no Nuvio com múltiplos catálogos e opções, sem alterar a versão funcional publicada.

## 4. Investigação observável do Nuvio

O Nuvio Desktop 1.1.35 foi observado instalando o manifest por URL, exibindo RADIO BR, catálogo TV, nomes, posters e player. Isso comprova o fluxo básico da Fase 1.

A documentação do Nuvio Web informa que:

- Nuvio fala o protocolo de addons do Stremio;
- a instalação aceita URL de manifest;
- a página de addon exibe catálogos e extras como busca/gênero;
- vários catálogos podem alimentar a home;
- a ordem dos addons e catálogos influencia a apresentação.

Essas informações são evidência útil sobre a família de clientes Nuvio, mas não comprovam isoladamente o comportamento do Nuvio Desktop 1.1.35 para filtros customizados, 27 UFs ou limites de quantidade. O design trata esses pontos como hipóteses de compatibilidade, não como garantias.

## 5. Proposta de organização dos catálogos

### 5.1 Visões conceituais

O catálogo v2 deverá ter estas visões lógicas, sujeitas ao spike de compatibilidade:

1. **Rádios em destaque** — ranking automático, sem estação fixa.
2. **Rádios do Brasil** — visão geral atual, preservada para regressão.
3. **Por gênero** — filtragem baseada em categorias derivadas de tags.
4. **Por estado** — filtragem baseada exclusivamente no estado normalizado.
5. **Localização não informada** — estações brasileiras sem estado confiável.

### 5.2 Estratégia de exposição

Proposta inicial de manifest, a validar antes de implementar:

- `radio-br-featured` sem filtro obrigatório;
- `radio-br-all` sem filtro obrigatório;
- `radio-br-genre` com `extra.search`, `extra.genre` e opções de gêneros suportados;
- `radio-br-state` com `extra.search` e uma forma de seleção estadual ainda pendente de comprovação;
- `radio-br-unknown-location` sem filtro obrigatório.

Se o Nuvio Desktop não apresentar `state` como extra customizado, a alternativa segura é declarar catálogos estaduais estáticos apenas se o spike demonstrar que a quantidade é utilizável. Caso contrário, a navegação estadual deve ser adiada, mantendo os dados disponíveis no catálogo geral e na busca.

O catálogo atual `radio-br-catalog` deverá ser preservado como alias ou substituído somente com uma decisão de migração e teste de instalação; não se deve quebrar URLs instaladas sem necessidade.

## 6. Estratégia de rádios em destaque

O ranking será calculado por lote usando dados da Radio Browser, nunca por lista manual. A API deverá trazer, quando disponível, `clickcount`, `lastcheckok`, `url_resolved`, `url`, `favicon`, `homepage`, `codec`, `bitrate`, `language`, `tags` e `state`.

### 6.1 Exclusões obrigatórias

Excluir antes do ranking:

- `countrycode` diferente de `BR`;
- `stationuuid` ausente ou inválido;
- `lastcheckok` explicitamente igual a `0` ou `'0'`;
- ausência de `url_resolved` e `url` utilizáveis;
- registros duplicados pelo mesmo `stationuuid`;
- nome vazio apenas quando não houver qualquer identificação mínima aceitável;
- dados que não possam ser convertidos para o modelo interno sem inventar valores.

### 6.2 Ordenação determinística

Após as exclusões, ordenar por uma chave estável:

1. `clickcount` descendente, tratando ausente como zero;
2. `lastcheckok` explícito aprovado antes de ausente;
3. qualidade de metadados, com pontos somente para campos presentes: nome, favicon, homepage, estado, idioma, tags e codec/bitrate;
4. URL resolvida antes de fallback apenas quando a fonte fornecer ambas;
5. `stationuuid` ascendente como desempate final.

O score não deve alegar que a estação está reproduzindo. Disponibilidade é apenas um filtro baseado no sinal fornecido pela API; a reprodução real continua sendo responsabilidade do teste de compatibilidade.

## 7. Estratégia de classificação por gênero

### 7.1 Normalização de tags

Normalizar somente para classificação, preservando as tags originais para metadados:

- separar por vírgula;
- remover espaços nas extremidades;
- converter para minúsculas com locale estável;
- remover acentos para comparação;
- colapsar espaços e separadores repetidos;
- eliminar duplicatas;
- não usar o nome da estação, homepage ou domínio como fonte de gênero.

### 7.2 Correspondências explícitas

As categorias devem ser tabelas de aliases versionadas no código, não heurísticas livres:

| Categoria         | Exemplos de tags normalizadas                      |
| ----------------- | -------------------------------------------------- |
| Notícias          | `news`, `noticias`, `jornalismo`, `talk`, `spoken` |
| Esportes          | `sports`, `esportes`, `football`, `futebol`        |
| Música            | `music`, `musica`, `variedades`, `entertainment`   |
| Sertanejo         | `sertanejo`, `country`, `caipira`                  |
| Pagode            | `pagode`                                           |
| Samba             | `samba`                                            |
| Rock              | `rock`, `classic rock`, `hard rock`, `alternative` |
| Gospel            | `gospel`, `religious`, `cristã`, `cristao`         |
| Pop               | `pop`, `top 40`, `hits`                            |
| MPB               | `mpb`, `brazilian popular music`                   |
| Música eletrônica | `electronic`, `dance`, `house`, `techno`, `trance` |

Esses aliases são proposta inicial e devem ser revisados contra uma amostra real antes do código. Uma tag pode corresponder a mais de uma categoria apenas quando houver correspondência explícita; isso permite que uma estação pertença a múltiplas categorias.

### 7.3 Ambiguidade e ausência

- Tags conflitantes não serão resolvidas por prioridade implícita.
- Tags genéricas como `radio`, `live`, `brasil` ou `online` não classificam por si só.
- Sem correspondência, a estação fica em “Outros gêneros identificados” somente se houver alguma tag não vazia; sem tags, fica em “Gênero não informado”.
- O agrupamento não deve excluir a estação do catálogo geral.

## 8. Estratégia por estado

O campo `state` da Radio Browser será a única fonte de localização. Nenhuma inferência será feita pelo nome, domínio, homepage, prefixo telefônico ou cidade mencionada em outro campo.

### 8.1 Normalização proposta

Aplicar trim, caixa uniforme, remoção de acentos para comparação e mapeamento explícito para as 27 UFs:

| UF  | Nomes/abreviações aceitos                |
| --- | ---------------------------------------- |
| AC  | Acre, AC                                 |
| AL  | Alagoas, AL                              |
| AP  | Amapá, Amapa, AP                         |
| AM  | Amazonas, AM                             |
| BA  | Bahia, BA                                |
| CE  | Ceará, Ceara, CE                         |
| DF  | Distrito Federal, Brasília, Brasilia, DF |
| ES  | Espírito Santo, Espirito Santo, ES       |
| GO  | Goiás, Goias, GO                         |
| MA  | Maranhão, Maranhao, MA                   |
| MT  | Mato Grosso, MT                          |
| MS  | Mato Grosso do Sul, MS                   |
| MG  | Minas Gerais, MG                         |
| PA  | Pará, Para, PA                           |
| PB  | Paraíba, Paraiba, PB                     |
| PR  | Paraná, Parana, PR                       |
| PE  | Pernambuco, PE                           |
| PI  | Piauí, Piaui, PI                         |
| RJ  | Rio de Janeiro, RJ                       |
| RN  | Rio Grande do Norte, RN                  |
| RS  | Rio Grande do Sul, RS                    |
| RO  | Rondônia, Rondonia, RO                   |
| RR  | Roraima, RR                              |
| SC  | Santa Catarina, SC                       |
| SP  | São Paulo, Sao Paulo, SP                 |
| SE  | Sergipe, SE                              |
| TO  | Tocantins, TO                            |

Valores vazios, desconhecidos ou que correspondam a mais de uma UF serão `unknown`. A estação aparecerá em “Localização não informada”.

## 9. Padronização quadrada dos logotipos

O addon pode declarar `posterShape: 'square'` e escolher a URL original do favicon. Isso é o limite seguro do contrato do addon. O addon não controla `object-fit`, dimensões CSS, fundo neutro ou tratamento de transparência no Nuvio.

Proposta:

- manter a imagem original sem reprocessamento;
- enviar `posterShape: 'square'` sempre que houver favicon;
- usar um asset quadrado de fallback estável, genérico do RADIO BR, somente se for aprovado como asset do projeto;
- não transformar imagens circulares em novas imagens, não esticar e não recortar via proxy;
- documentar que contain/fundo neutro dependem do cliente Nuvio;
- não iniciar serviço externo de imagens.

Critério de aceitação visual: o Nuvio deve exibir o item em slot quadrado e preservar a legibilidade da imagem; qualquer comportamento diferente será limitação do cliente, não algo a ser corrigido com proxy sem nova decisão.

## 10. Arquitetura proposta

Reutilizar os módulos atuais e adicionar apenas responsabilidades puras:

```text
radio-browser/client
  -> stations/normalize
  -> stations/tags
  -> stations/locations
  -> catalog/ranking
  -> catalog/grouping
  -> catalog/catalog
  -> addon handlers atuais
```

Módulos sugeridos:

- `stations/tags`: `normalizeTags(tags)` e `classifyTags(tags)`, sem acesso HTTP.
- `stations/locations`: `normalizeBrazilianState(rawState)`, sem inferência.
- `catalog/ranking`: `rankFeaturedStations(stations)`, determinístico e puro.
- `catalog/grouping`: agrupamento por gênero/UF, preservando múltiplas categorias.
- `catalog/catalog`: resolve IDs de catálogo e monta previews; não repete regras de normalização.
- `radio-browser/client`: amplia tipos e campos solicitados, mantendo cache e User-Agent.

O cliente deverá buscar lotes suficientes para ranking e agrupamento, mas a estratégia precisa respeitar limites e TTL; não fazer uma requisição por categoria. Uma consulta base cacheada deve alimentar todas as visões compatíveis. Busca textual pode continuar usando o parâmetro `name` da API.

IDs de catálogo e opções devem ser constantes de configuração, não derivados de nomes de estações. Metadados e streams continuam consumindo o mesmo ID de estação e os mesmos serviços atuais.

## 11. Estratégia de testes

Todos os testes serão determinísticos com fixtures; nenhuma prova de classificação dependerá da Radio Browser em tempo real.

### Novos testes

- ranking: clickcount, disponibilidade, completude, empate por UUID e exclusões;
- tags: acentos, caixa, aliases, tags genéricas, múltiplas categorias e ausência;
- estados: as 27 UFs, abreviações, acentos, valor desconhecido e ausência sem inferência;
- posters: favicon ausente, `posterShape: 'square'`, fallback e preservação da URL;
- catálogos: IDs de visão, gênero, estado, localização desconhecida, pesquisa e `skip`;
- cache: uma consulta base alimentando várias visões e expiração;
- compatibilidade: manifest e handlers atuais permanecem com as mesmas respostas para `radio-br-catalog`, meta e stream.

### Regressão obrigatória

Executar os 10 testes atuais, além dos novos, e manter:

```text
npm test -- --run
npm run build
npm run lint
npm run format:check
```

Nenhum teste unitário substitui a validação manual no Nuvio. Após implementação, o spike deverá testar múltiplos catálogos, extras de gênero/estado, posters quadrados e as plataformas disponíveis antes de declarar compatibilidade.

## 12. Riscos e decisões pendentes

### Riscos

- muitos catálogos podem poluir a home do Nuvio ou exceder limites práticos do cliente;
- extras customizados podem ser ignorados ou não exibidos no Nuvio Desktop;
- `clickcount` pode estar ausente, defasado ou representar popularidade sem disponibilidade atual;
- tags da Radio Browser podem ser inconsistentes, multilíngues ou genéricas;
- `state` pode conter valores livres que não mapeiam com segurança;
- favicon externo pode estar quebrado, irregular ou fora do tamanho recomendado;
- um ranking em lote pode aumentar custo de API se não reutilizar o cache;
- `posterShape` não garante comportamento visual idêntico entre clientes.

### Decisões pendentes antes da implementação

1. Quantos catálogos o Nuvio Desktop 1.1.35 apresenta de forma útil?
2. O Nuvio Desktop apresenta `extra.genre` com opções e envia o valor ao handler?
3. O Nuvio Desktop aceita e envia um extra customizado `state`?
4. É melhor expor estados como catálogos individuais ou manter a navegação estadual adiada?
5. Qual asset quadrado genérico será aprovado para fallback, se necessário?
6. Qual tamanho máximo de lote e TTL mantém o ranking atual sem pressionar a API?

## 13. Critérios de aceitação do design

O design estará pronto para virar plano de implementação somente quando:

- os contratos atuais da Fase 1 estiverem preservados;
- a estratégia de ranking for determinística e sem lista manual;
- gênero usar somente tags com aliases explícitos;
- estado usar somente `state` normalizado, incluindo “Localização não informada”;
- limitações de `posterShape` e ausência de proxy estiverem documentadas;
- existir uma decisão ou spike aprovado para múltiplos catálogos e extras no Nuvio Desktop;
- testes novos e regressão dos 10 testes atuais estiverem definidos;
- nenhuma compatibilidade for declarada sem evidência observável.

## Referências investigadas

- `stremio-addon-sdk` 1.6.10 instalado no projeto.
- Documentação do SDK: [catalogs e extras](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md), [defineCatalogHandler](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md), [Meta Preview Object](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md).
- Nuvio Web Addons: [documentação de addons e múltiplos catálogos](https://orochibraru.com/nuvio-web/docs/addons).
- Implementação atual: `src/addon`, `src/catalog`, `src/stations`, `src/radio-browser`, `docs/architecture.md` e `docs/RADIO_BR_CATALOG_EVOLUTION.md`.

## Addendum — Compatibility Spike 2 e identidade visual

A segunda investigação confirmou novamente os contratos da Fase 1 e os comandos de regressão, mas não conseguiu manter um servidor experimental isolado acessível. Portanto, múltiplos catálogos, `extra.genre`, `extra.state`, `logo`, `background` e casos visuais extremos continuam pendentes de prova no Nuvio Desktop 1.1.35.

O SDK 1.6.10 documenta `logo` como URL para PNG monocromático, com recomendação de 256×256, e `background` como URL para PNG/JPG, com recomendação mínima de 1024×786. Esses campos são válidos no manifest, mas a investigação não confirmou como o Nuvio Desktop os exibe, recorta ou trata quando a URL falha. Não serão criados assets ou proxies sem aprovação.

Foi observado um lote real de 100 estações brasileiras da Radio Browser: 100 com `clickcount`, 75 com `state`, 85 com `tags`, 72 com `favicon` e 100 com `url_resolved`. Os codecs predominantes foram AAC+ (44), MP3 (32) e AAC (21). Esses dados sustentam a estratégia de ranking e agrupamento, mas não constituem prova de reprodução.

Para descrições individuais, a evolução deve compor blocos somente com `name`, `homepage`, `state`, `language`, `tags`, `codec`, `bitrate` e demais campos realmente presentes. A ausência de dados deve permanecer explícita; não se deve inferir cidade, estado, gênero ou descrição editorial.

O parecer da Spike 2 mantém o design **não pronto para plano de implementação**. Antes da implementação, deve existir um servidor experimental persistente, com logs de `catalog id` e `extra`, capaz de ser instalado sem substituir o addon funcional. A reprodução AAC/AAC+ observada anteriormente por aproximadamente 6:45 permanece como regressão; MP3, OGG e HLS continuam pendentes.
