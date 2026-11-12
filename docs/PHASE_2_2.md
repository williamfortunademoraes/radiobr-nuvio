# Fase 2.2 — navegação por gêneros

Implementação local da navegação por gêneros no addon `com.williamfortuna.radio-br`. Nenhuma publicação, commit ou alteração no addon instalado no perfil principal do Nuvio foi feita nesta etapa.

## Estratégia escolhida

**Preferência A — catálogo único com filtro `extra.genre`.**

- O SDK 1.6.10 declara `genre` como extra de catálogo e aceita `options` no manifest.
- Um único catálogo `radio-br-genre` evita 13 linhas na home do Nuvio e mantém a navegação agrupada.
- O handler recebe `args.extra.genre` e aplica o filtro localmente sobre a mesma coleção normalizada usada pelos demais catálogos.
- Sem filtro, o catálogo por gênero mostra todas as estações retornadas, funcionando como visão geral caso o cliente não apresente o seletor.
- A exibição e o envio de `extra.genre` pelo Nuvio Desktop **não foram comprovados** nesta entrega. Se o seletor não aparecer no teste experimental, a Preferência B (catálogos individuais por gênero) fica como alternativa documentada, sem implementação simultânea.

## Categorias e aliases

As categorias seguem a ordem canônica do manifest. A classificação usa correspondência exata de tag normalizada, nunca nome, domínio, homepage ou localização.

| Categoria                    | Aliases normalizados                                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Notícias                     | `news`, `noticia`, `noticias`, `jornalismo`, `jornalistico`, `journalism`, `talk`, `talk radio`, `spoken`, `spoken word`                  |
| Esportes                     | `sport`, `sports`, `esporte`, `esportes`, `futebol`, `football`                                                                           |
| Música                       | `music`, `musica`, `musical`, `musica variada`, `variedades musicais`                                                                     |
| Sertanejo                    | `sertanejo`, `sertaneja`, `sertanejo universitario`, `sertanejo raiz`, `modao`, `moda de viola`                                           |
| Pagode                       | `pagode`, `pagode brasileiro`                                                                                                             |
| Samba                        | `samba`, `samba brasileiro`, `samba de raiz`                                                                                              |
| Rock                         | `rock`, `classic rock`, `rock nacional`, `hard rock`, `rock alternativo`, `alternative`, `alternativo`, `indie rock`, `punk`, `punk rock` |
| Gospel                       | `gospel`, `musica gospel`, `christian`, `cristao`, `crista`, `religious`, `religioso`, `religiosa`                                        |
| Pop                          | `pop`, `pop music`, `top 40`, `hits`                                                                                                      |
| MPB                          | `mpb`, `musica popular brasileira`                                                                                                        |
| Música eletrônica            | `eletronica`, `electronic`, `electronic music`, `electronica`, `dance`, `dance music`, `edm`, `house`, `techno`, `trance`                 |
| Outros gêneros identificados | sem aliases; recebe estações com tags não genéricas sem correspondência                                                                   |
| Gênero não informado         | sem aliases; recebe estações sem tags ou apenas com tags genéricas                                                                        |

## Normalização

1. Separar por vírgula (inclusive quando uma tag chega dentro de um item de lista).
2. Remover espaços excedentes.
3. Converter para minúsculas.
4. Aplicar `NFKD` e remover marcas diacríticas para comparação.
5. Substituir `&` por `e` e padronizar separadores (`_`, `/`, `-` e pontuação) como espaço.
6. Colapsar espaços repetidos e eliminar itens vazios.
7. Eliminar duplicatas, preservando a primeira ocorrência.
8. Manter as tags originais intactas em `Station.tags` para metadados.

Tags genéricas (`radio`, `live`, `brasil`, `online`, `fm`, `webradio`, `station`, `tv`, entre outras) não classificam gênero e não contam como gênero identificado.

## Regras de agrupamento

- Uma estação pode aparecer em mais de uma categoria apenas quando suas próprias tags justificam cada uma.
- `Música` só recebe estações com tag musical explícita; uma estação apenas com `sertanejo` não é promovida a `Música`.
- Tags desconhecidas e não genéricas vão para `Outros gêneros identificados`.
- Estações sem tags ou apenas com tags genéricas vão para `Gênero não informado`.
- Estações de gênero não informado continuam no catálogo geral e no catálogo de destaque.
- O agrupamento preserva a ordem recebida da Radio Browser dentro de cada categoria.

## Exemplos reais de classificação

Amostra de 100 estações brasileiras obtida da Radio Browser em 12/11/2026, apenas para conferência manual (os testes automatizados usam fixtures):

| Estação               | Tags reais                                                     | Categorias                    |
| --------------------- | -------------------------------------------------------------- | ----------------------------- |
| Sertaneja 106.7       | `country, sertanejo`                                           | Sertanejo                     |
| BH FM 102,1 MHz       | `funk, internacional, nacional, pagode, pop, samba, sertanejo` | Pagode, Samba, Sertanejo, Pop |
| MGT GOSPEL            | `brasil, cristã, gospel, jesus`                                | Gospel                        |
| BR - The Classic Rock | `classic rock, hard rock, heavy metal, oldies, rock`           | Rock                          |
| 80 Hits Brasil        | `80's, 80s, mpb, musica brasileira, oldies`                    | MPB                           |
| Rádio Transdutor      | `... house, jungle, techno, underground electronic`            | Música eletrônica             |
| Smooth Jazz Lounge    | `jazz, smooth jazz, smooth lounge`                             | Outros gêneros identificados  |
| Kiss FM São Paulo     | sem tags                                                       | Gênero não informado          |

A distribuição dessa amostra foi: 8 Notícias, 6 Esportes, 2 Música, 11 Sertanejo, 8 Pagode, 8 Samba, 10 Rock, 3 Gospel, 16 Pop, 10 MPB, 5 Música eletrônica, 27 Outros gêneros identificados e 14 Gênero não informado. Uma estação pode contar em mais de uma categoria.

## Cache e desempenho

- O catálogo de gênero usa exatamente a mesma consulta base dos catálogos geral e de destaque (`countrycode=BR`, `limit=100`, `offset=0`), portanto reaproveita a entrada existente do `MemoryCache` do cliente.
- Nenhuma consulta por gênero é feita à Radio Browser; o filtro é local.
- O resultado do agrupamento é memoizado por identidade da coleção de estações (`WeakMap`), evitando reclassificar o mesmo lote em requisições consecutivas.
- A busca textual continua usando o parâmetro `name` e possui chave de cache própria, como antes.
- O TTL existente não foi alterado.

## Arquivos

Criados:

- `src/stations/tags.ts`
- `src/catalog/grouping.ts`
- `tests/stations/tags.test.ts`
- `tests/catalog/grouping.test.ts`
- `docs/PHASE_2_2.md`

Modificados:

- `src/catalog/catalog.ts`
- `src/addon/manifest.ts`
- `tests/catalog/catalog.test.ts`
- `tests/addon/handlers.test.ts`
- `tests/addon/http.test.ts`
- `tests/addon/manifest.test.ts`
- `README.md`
- `docs/endpoints.md`
- `docs/architecture.md`

## Validação

```text
npm test -- --run   -> 11 arquivos, 83 testes aprovados
npm run build       -> aprovado
npm run lint        -> aprovado
npm run format:check -> aprovado
```

## Teste experimental no Nuvio

Pré-requisito: usar um **perfil separado** do Nuvio. O ID técnico é o mesmo do addon atual; instalar no perfil principal pode substituir a instalação existente.

```powershell
$env:PORT='7002'
npm run dev
```

Manter o terminal aberto e instalar `http://127.0.0.1:7002/manifest.json` no perfil separado.

Catálogos esperados em Configurações/Mídia ou na home:

- **Rádios em destaque**
- **Rádios por gênero** — com filtro de gênero, se o cliente exibir extras
- **Rádios do Brasil**

Cenários:

1. Abrir **Rádios por gênero** sem filtro: devem aparecer estações do lote geral.
2. Selecionar **Sertanejo**: somente estações com tags de sertanejo.
3. Selecionar **Notícias**: somente estações com tags de notícias/jornalismo.
4. Selecionar **Gênero não informado**: estações sem tags ou apenas com tags genéricas.
5. Selecionar **Outros gêneros identificados**: estações com tags desconhecidas, como `forró`.
6. Reproduzir uma estação de qualquer catálogo e confirmar que a URL é a mesma do catálogo original, sem proxy.
7. Confirmar que **Rádios do Brasil** e **Rádios em destaque** continuam com o comportamento anterior.
8. Verificar se o Nuvio exibe o seletor de gênero. Se não exibir, registrar como limitação do cliente e avaliar a Preferência B.

## Limitações conhecidas

- A classificação depende exclusivamente das tags fornecidas pela Radio Browser; tags ausentes, inconsistentes ou genéricas não são corrigidas por inferência.
- `Notícias` inclui `talk` e `spoken`, que podem representar programação falada sem foco jornalístico.
- `Música` é uma categoria ampla e não recebe automaticamente subgêneros.
- Tags como `forró`, `axé`, `jazz` e `blues` ficam em `Outros gêneros identificados` porque não há categoria inicial correspondente.
- A presença do filtro `extra.genre` e sua interface no Nuvio Desktop 1.1.35 não foram comprovadas; somente o contrato do SDK e o fluxo HTTP foram verificados.
- A reprodução real de cada stream continua dependendo do teste manual no cliente.
