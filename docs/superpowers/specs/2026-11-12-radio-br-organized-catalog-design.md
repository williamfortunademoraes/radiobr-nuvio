# RADIO BR — catálogo nacional organizado

## Intenção

Transformar o addon em um catálogo nacional organizado por Destaques, gênero, região, estado e catálogo completo, preservando os endpoints Stremio/Nuvio atuais, os IDs `radio-br:<stationuuid>` e a reprodução direta das emissoras.

## Estado atual relevante

- O manifesto declara catálogos planos com `type`, `id`, `name` e `extra`; o SDK não define navegação hierárquica nem capa de coleção.
- O catálogo atual consulta Radio Browser com `limit` máximo de 100, ordenado por `clickcount`, e filtra gêneros/UFs localmente.
- Estados são normalizados a partir do campo textual `state`; o modelo agora aceita `city` opcional, mas não infere cidade.
- A curadoria atual possui 13 itens manuais e será substituída pela coleção editorial Top 25.

## Objetivos

- Expor exatamente 25 posições na coleção `Destaques`, na ordem do ranking Radios.com.br.
- Manter snapshot editorial separado do catálogo Radio Browser e registrar correspondências ausentes.
- Expor gêneros como catálogos independentes sem duplicar emissoras dentro de cada catálogo.
- Expor cinco catálogos regionais, 27 catálogos estaduais e o catálogo nacional completo.
- Adicionar códigos IBGE e região aos dados estáticos dos estados.
- Preservar rádios sem UF/cidade no catálogo nacional.
- Ordenar por `clickcount` somente nos catálogos Radio Browser; nunca usar esse campo para alterar a ordem do Top 25.
- Versionar capas e identificações visuais sem substituir logos das emissoras.

## Não objetivos

- Criar frontend próprio, painel ou banco de dados.
- Fazer o Nuvio exibir uma árvore visual nativa Região → Estado → Cidade; o protocolo não oferece esse recurso.
- Inferir cidade, UF ou código IBGE a partir do nome, domínio, telefone ou URL.
- Substituir uma posição do ranking por uma rádio diferente quando não houver correspondência.

## Abordagem escolhida

Usar catálogos planos compatíveis com o protocolo atual:

- `radios-em-destaque` continuará sendo o catálogo técnico de `Destaques`, agora com 25 entradas editoriais.
- `radio-br-region-{regionId}` exibirá a união das estações identificadas na região.
- `radio-br-region-{uf}` continuará exibindo somente a UF correspondente, preservando a rota atual.
- `radio-br-genre-{genreId}` continuará sendo o catálogo independente de gênero.
- `radio-br-catalog` continuará sendo o catálogo nacional e aceitará `skip` para paginação.

Região e estado serão catálogos separados porque o cliente não suporta subníveis. A cidade será exibida nos metadados somente quando vier explicitamente da fonte; não será criada uma lista dinâmica de catálogos por cidade.

## Fonte editorial Top 25

Snapshot inicial: relatório **FM — Brasil — julho/2026**, URL:

`https://www.radios.com.br/estatistica/fm/2011/7?pais=33`

As 25 posições serão armazenadas em arquivo versionado com posição, nome publicado, localização, visitas e URL de referência do Radios.com.br. A coleta usa o endpoint de relatório carregado pela página, mas o addon não fará requisição dinâmica à fonte editorial.

O resolvedor cruzará cada posição com a coleção Radio Browser por identificador quando houver mapeamento e, secundariamente, por nome normalizado + UF explícita. A entrada editorial continuará existindo quando não houver estação correspondente, com estado `unmatched`/indisponível e sem URL inventada. Um relatório de correspondências ausentes será gerado para revisão.

## Gêneros

As definições atuais de gênero serão reutilizadas. Cada gênero terá ID, nome, descrição opcional e poster/capa estável. A classificação continuará baseada somente em tags explícitas; uma estação poderá aparecer em mais de um gênero quando as tags justificarem. A deduplicação será por `stationuuid` dentro de cada catálogo.

## Regiões e estados

Será criado um mapa estático dos 26 estados e DF com:

- UF;
- nome oficial;
- código IBGE: AC 12, AL 27, AP 16, AM 13, BA 29, CE 23, DF 53, ES 32, GO 52, MA 21, MT 51, MS 50, MG 31, PA 15, PB 25, PR 41, PE 26, PI 22, RJ 33, RN 24, RS 43, RO 11, RR 14, SC 42, SP 35, SE 28, TO 17;
- região;
- referência visual estável;
- contagem calculada sobre o conjunto carregado.

As cinco regiões serão Norte, Nordeste, Centro-Oeste, Sudeste e Sul. O filtro de região será calculado pela UF normalizada; estações sem UF continuarão apenas no catálogo nacional.

## Catálogo nacional completo

O cliente manterá a consulta em páginas de até 100 itens e adicionará um agregador paginado/cacheado para o catálogo nacional. A resposta continuará respeitando o limite de página do Stremio (`skip`), sem duplicações por `stationuuid`. A ordenação será `clickcount` decrescente quando informado; valores ausentes ficarão depois dos valores conhecidos, preservando a ordem recebida entre empates.

O carregamento total será lazy e cacheado por TTL. Catálogos regionais, estaduais e de gênero continuarão podendo usar o lote compartilhado quando a cobertura total não for necessária; a documentação deixará explícita a diferença entre lote carregado e catálogo nacional completo.

## Capas e identidade visual

As capas serão versionadas em `assets/collections/`, com dimensões padronizadas e URLs locais estáveis. Haverá capas para os gêneros e cinco regiões; estados terão referência visual própria ou equivalente. Como o manifesto do SDK não define uma propriedade de capa por catálogo, as imagens serão preparadas para uso em metadados/fallbacks e a limitação de renderização no Nuvio será documentada. Logos originais das rádios sempre terão prioridade.

## Compatibilidade

`type: tv`, rotas de catálogo, metadados e streams permanecem inalterados para o cliente. Serão adicionados IDs de catálogo novos e mantidos aliases/rotas antigas quando isso não conflitar com a remoção anterior do ranking automático. A hierarquia visual Região → Estado → Cidade fica documentada como limitação do protocolo, não como uma promessa de UI.

## Testes e entrega

- Testar exatamente 25 posições e ordem editorial.
- Testar correspondências, indisponíveis e ausência de substituição.
- Testar gêneros, regiões, 27 UFs, códigos IBGE, filtragem e deduplicação.
- Testar cidade explícita versus cidade ausente.
- Testar ordenação/paginação nacional, rádios sem localização e preservação de logos/URLs.
- Executar testes unitários, integração HTTP, navegador, lint, typecheck e build.
- Criar `docs/RADIO_BR_ORGANIZED_CATALOG_REPORT.md` com arquivos, fontes, critérios, limitações, resultados e pendências visuais.
