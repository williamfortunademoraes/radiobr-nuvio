# RADIO BR — Coleções de gêneros e regiões

## Objetivo

Adicionar à home do Nuvio duas coleções independentes, “Gêneros Musicais” e “Regiões”, usando o contrato de catálogos do addon. O Nuvio renderiza os carrosséis, capas, foco, hover, teclado e controle remoto; este repositório fornecerá os cards, IDs, filtros e imagens.

## Escopo

- 18 gêneros solicitados, com associação múltipla por tags explícitas da Radio Browser.
- Cinco regiões, 26 estados e Distrito Federal, derivados exclusivamente do estado geográfico disponível.
- Navegação por catálogo: coleção → subcoleção/rádios → reprodução existente.
- Capas locais quadradas para gêneros, regiões e estados, servidas pelo addon.
- Catálogo geral, favoritos, metadados e streams existentes preservados.
- Duplicidade eliminada por `stationuuid`; nenhuma associação por nome, domínio ou suposição.

Fora do escopo: frontend independente, painel administrativo, banco de dados, proxy de áudio/imagens e edição manual de rádios.

## Abordagens consideradas

1. Catálogos independentes e IDs hierárquicos — escolhida por ser compatível com o addon atual e com a home automática do Nuvio.
2. Um único catálogo com extras para gênero/estado — descartada porque não produz cards de coleções na home nem a navegação visual desejada.
3. Frontend embutido separado — descartada porque o repositório não possui frontend e o Nuvio já é responsável pela apresentação.

## Decisões de implementação

- Adicionar uma camada de entidades de coleção no catálogo, sem alterar o tipo `tv` nem os IDs de rádio.
- Usar IDs estáveis para gênero, região e UF; os handlers resolvem a coleção e retornam previews com `poster` e `posterShape: 'square'`.
- Usar `state` normalizado com tabela explícita para as 27 UFs. Valores ausentes ou desconhecidos ficam pendentes/não informados e não entram em uma UF por inferência.
- Reutilizar uma única lista cacheada de estações por consulta para todos os agrupamentos.
- Manter o catálogo antigo como regressão compatível.
- Gerar capas locais determinísticas com identidade visual consistente; não criar imagens de rádios nem substituir favicons existentes.

## Arquivos previstos

- `src/stations/tags.ts`, `src/stations/locations.ts`, `src/stations/types.ts` e normalização associada.
- `src/catalog/grouping.ts`, `src/catalog/catalog.ts` e `src/catalog/collections.ts`.
- `src/addon/manifest.ts`, `src/metadata/metadata.ts` e servidor de assets existente/novo.
- `assets/collections/*` para capas.
- testes de tags, localização, agrupamento, catálogo, manifest e assets.
- `docs/architecture.md` para registrar o novo fluxo.

## Validação

Serão executados `npm test`, `npm run build`, `npm run lint` e `npm run format:check`. Os testes cobrirão os 18 gêneros, 5 regiões, 27 UFs, associação múltipla, ausência de inferência, IDs, posters, filtragem, navegação e regressão de reprodução/metadata.

## Pendência de compatibilidade

O contrato final de renderização é do Nuvio. A implementação validará o manifest e os handlers localmente; a aparência exata dos carrosséis deverá ser conferida instalando o addon no Nuvio após o build.
