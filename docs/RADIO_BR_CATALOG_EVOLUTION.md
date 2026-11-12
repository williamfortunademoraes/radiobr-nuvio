# RADIO BR — Proposta de evolução do catálogo

Este documento registra requisitos para uma etapa futura de evolução do catálogo. Ele não altera o comportamento atual, não cria categorias agora e não inicia a Fase 2.

## Princípios

- A Radio Browser API continuará sendo a fonte dinâmica.
- Não haverá lista manual como fonte principal.
- Classificações e agrupamentos usarão apenas dados reais disponíveis.
- Ausência de informação permanecerá explícita; não haverá atribuição por suposição.
- A evolução deverá preservar os handlers Stremio existentes e ser validada antes de qualquer alteração de produção.

## Rádios em destaque

Prever uma seção de rádios principais ou populares, calculada automaticamente a partir de sinais como:

- popularidade e número de acessos (`clickcount`), quando disponível;
- disponibilidade indicada pela API;
- país Brasil;
- qualidade e consistência dos metadados;
- presença de URL de transmissão utilizável.

A classificação deverá ser reavaliada dinamicamente e não deverá incorporar uma relação fixa de estações.

## Organização por tipo de programação

Prever agrupamentos derivados das tags e demais informações reais das estações. Os grupos iniciais possíveis são:

- Notícias;
- Esportes;
- Música;
- Sertanejo;
- Pagode;
- Samba;
- Rock;
- Gospel;
- Pop;
- MPB;
- Música eletrônica;
- Outros gêneros identificados.

Uma estação só deverá aparecer em um grupo quando houver dados suficientes para justificar o agrupamento. Tags vazias, ambíguas ou insuficientes não devem gerar uma classificação inventada; nesses casos, a estação permanecerá no catálogo geral ou em um agrupamento de tipo não informado, conforme decisão futura.

## Organização por estado

Prever navegação por unidade federativa usando o campo de estado da Radio Browser quando disponível:

Acre, Alagoas, Amapá, Amazonas, Bahia, Ceará, Distrito Federal, Espírito Santo, Goiás, Maranhão, Mato Grosso, Mato Grosso do Sul, Minas Gerais, Pará, Paraíba, Paraná, Pernambuco, Piauí, Rio de Janeiro, Rio Grande do Norte, Rio Grande do Sul, Rondônia, Roraima, Santa Catarina, São Paulo, Sergipe e Tocantins.

Estações sem localização identificável deverão permanecer em “Localização não informada”. Nenhum estado deverá ser inferido pelo nome da estação, domínio, homepage ou qualquer outra pista indireta sem regra explícita e validação posterior.

## Padronização visual dos ícones

Como diretriz para a futura apresentação do catálogo:

- todos os ícones/logotipos ocuparão espaços quadrados;
- a proporção visual será fixa em 1:1;
- as dimensões serão consistentes entre estações;
- imagens circulares ou formatos irregulares não serão usados como moldura de apresentação;
- o logotipo original permanecerá legível e não será distorcido ou modificado;
- quando necessário, será usado `object-fit: contain`;
- imagens transparentes poderão receber fundo neutro;
- estações sem logotipo terão um ícone quadrado de fallback.

Essa diretriz descreve a apresentação futura do catálogo e não cria frontend ou interface própria no addon.

## Fora do escopo desta etapa

- Não implementar seções, filtros ou agrupamentos.
- Não ampliar a consulta atual nem alterar handlers.
- Não criar frontend.
- Não modificar o Nuvio.
- Não iniciar a Fase 2.
