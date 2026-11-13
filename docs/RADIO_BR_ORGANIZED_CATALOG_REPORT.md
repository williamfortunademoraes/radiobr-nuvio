# Relatório de implementação — catálogo organizado RADIO BR

## Arquivos principais

- `src/editorial/top-25-ranking.ts`: fotografia editorial das 25 posições do Radios.com.br.
- `src/editorial/top-25-match.ts`: cruzamento editorial separado do catálogo dinâmico.
- `src/catalog/geography.ts`: cinco regiões, 26 estados e Distrito Federal, códigos UF e IBGE.
- `src/catalog/covers.ts` e `assets/collections/`: referências versionadas de capas de gêneros, regiões e estados.
- `src/radio-browser/client.ts`: paginação do catálogo nacional completo, deduplicação e ordenação por clickcount conhecido.
- `src/catalog/catalog.ts` e `src/config/addon-config.ts`: catálogos Top 25, gêneros, regiões, estados e catálogo nacional.
- `src/metadata/metadata.ts`: apresentação com links de cidade, estado e gênero, sem país, idioma ou TV.

## Estrutura final

- `Destaques`: exatamente 25 posições na ordem do ranking editorial.
- Gêneros consolidados: Notícias e esportes, Samba e pagode, Sertanejo, Rock, Gospel, Pop, MPB, Música eletrônica e Outros gêneros.
- Regiões: Norte, Nordeste, Centro-Oeste, Sudeste e Sul.
- Estados: 26 UFs e DF, preservando os catálogos estaduais existentes.
- `Todas as rádios`: consulta paginada nacional, com clickcount decrescente quando conhecido e estações sem popularidade ao final.

## Critérios

Classificação geográfica usa somente `state` normalizado; código IBGE fica disponível no mapa editorial. Cidade é apresentada quando fornecida pela fonte. Rádios sem localização continuam no catálogo nacional e não são atribuídas a um estado por inferência.

As capas são SVGs locais, estáveis e padronizadas. Elas não substituem os logos das emissoras.

## Compatibilidade e limitações

O contrato existente do Stremio/Nuvio é plano: cada região, estado, gênero e rádio é exposto como catálogo `tv`. Por isso Região → Estado → Cidade não pode ser representado como subcatálogo aninhado no manifesto atual; a navegação regional e estadual está disponível em catálogos compatíveis, enquanto cidade permanece metadata/filtro futuro.

## Verificação

Foram adicionados testes para: 25 posições e ordem; correspondência e itens sem correspondência; regiões e 27 unidades federativas; filtragem por UF/região; paginação, deduplicação e popularidade; capas; metadata e reprodução. A entrega deve ser validada com `npm test -- --run`, `npm run build`, `npm run lint` e `npm run format:check`.
