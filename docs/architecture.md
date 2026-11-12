# Arquitetura

`radio-browser` concentra HTTP, parâmetros obrigatórios e cache TTL. `stations` normaliza a resposta externa em um modelo interno e elimina registros não brasileiros, quebrados ou sem URL.

`stations/tags` é um módulo puro de normalização e classificação por gênero. Ele converte tags em uma forma comparável (minúsculas, sem acentos, separadores padronizados, sem duplicatas), aplica aliases explícitos e devolve IDs de categoria. As tags originais permanecem em `Station.tags`; o módulo não infere gênero por nome, domínio, homepage ou localização. `Outros gêneros identificados` e `Gênero não informado` são decididos pelo agrupamento, não pelos aliases.

`catalog/grouping` agrupa as estações em todas as categorias de uma vez, preservando a ordem recebida e permitindo que uma estação apareça em mais de um gênero quando as tags justificarem. O resultado é memoizado por identidade da coleção com `WeakMap`, evitando reclassificação do mesmo lote cacheado.

`catalog`, `metadata` e `streams` transformam o modelo interno nos contratos do protocolo. O catálogo `radio-br-genre` usa o mesmo `searchStations` dos catálogos geral e de destaque e filtra localmente, sem consulta adicional por gênero. O filtro chega em `args.extra.genre`; sem filtro, o catálogo mostra a coleção completa.

`addon` compõe esses serviços com `addonBuilder` do `stremio-addon-sdk` 1.6.10. O cliente recebe `fetch` e cache por injeção, permitindo testes sem rede.

Não há frontend, banco, catálogo manual, proxy ou conversão de áudio.
