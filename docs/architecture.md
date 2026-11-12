# Arquitetura

`radio-browser` concentra HTTP, parâmetros obrigatórios e cache TTL. `stations` normaliza a resposta externa em um modelo interno e elimina registros não brasileiros, quebrados ou sem URL.

`stations/tags` é um módulo puro de normalização e classificação por gênero. Ele converte tags em uma forma comparável (minúsculas, sem acentos, separadores padronizados, sem duplicatas), aplica aliases explícitos e devolve IDs de categoria. As tags originais permanecem em `Station.tags`; o módulo não infere gênero por nome, domínio, homepage ou localização. `Outros gêneros identificados` e `Gênero não informado` são decididos pelo agrupamento, não pelos aliases.

`catalog/grouping` agrupa as estações em todas as categorias de uma vez, preservando a ordem recebida e permitindo que uma estação apareça em mais de um gênero quando as tags justificarem. O resultado é memoizado por identidade da coleção com `WeakMap`, evitando reclassificação do mesmo lote cacheado.

`catalog`, `metadata` e `streams` transformam o modelo interno nos contratos do protocolo. O catálogo `radio-br-genre` usa o mesmo `searchStations` dos catálogos geral e de destaque e filtra localmente, sem consulta adicional por gênero. O filtro chega em `args.extra.genre`; sem filtro, o catálogo mostra a coleção completa.

`addon` compõe esses serviços com `addonBuilder` do `stremio-addon-sdk` 1.6.10. O cliente recebe `fetch` e cache por injeção, permitindo testes sem rede.

`server` compõe Express com `getRouter` oficial. A página própria (`web/pages`, `assets/site.css`, `assets/personalizar.js`) é parte do addon. O SDK 1.6.10 usa `manifest.config` para habilitar `/:config?` e entrega JSON decodificado em `args.config`. `behaviorHints.configurable` anuncia configuração ao cliente. `serveHTTP` não oferece manifesto dinâmico: o servidor intercepta os manifests e mantém os recursos no roteador oficial.

`config/addon-config` valida versão, listas permitidas, quantidade, tamanho e opções; rejeita campos desconhecidos. Serializa em ordem canônica usando `encodeURIComponent(JSON.stringify(...))`. `POST /api/configuration` retorna a URL usando `ADDON_BASE_URL` e o manifesto correspondente. Não há registro por usuário.

O manifesto padrão mantém os catálogos existentes, incluindo curadoria editorial. O personalizado inclui coleções e gêneros selecionados; regionais ficam limitados às UFs selecionadas ou às 27 UFs quando não há restrição. Metadados e catálogos omitem poster quando solicitado; o cliente pode exibir substitutos próprios. Streams e IDs permanecem iguais.

Estados usam somente o campo `state` da fonte, normalizado por nomes e UFs explícitos. Cidades não estão no contrato v1; podem ser acrescentadas em versão futura quando houver dados confiáveis. Curadoria filtrada por estado exige estação resolvida com UF da fonte. Gêneros controlam as coleções musicais, sem restringir catálogo geral ou ranking por gênero.

O cache TTL é compartilhado entre configurações e recursos. Requisições simultâneas da mesma consulta compartilham uma Promise; falhas liberam nova tentativa. Agrupamento por gênero continua memoizado por lote. Filtros locais operam no lote de até 100 estações; não representam cobertura integral do Brasil.

Sem banco, conta, proxy ou conversão de áudio.
