# Portal de rádios e player web — desenho

## Intenção

Transformar a página inicial do RADIO BR em um portal de rádios brasileiras inspirado em radiosbrasil.com.br, com descoberta por busca, catálogo visual e reprodução direta no navegador. A central de personalização e os manifestos do addon continuam disponíveis para Nuvio e Stremio.

O público principal é a pessoa que quer encontrar uma rádio rapidamente, iniciar a reprodução e continuar navegando pelo catálogo sem perder o áudio.

## Objetivos

- Fazer da home uma experiência de descoberta e reprodução, não apenas uma página institucional.
- Exibir seções úteis de rádios em destaque, gêneros e regiões usando os dados reais já consultados do Radio Browser.
- Criar um player global fixo no rodapé que preserve a estação ativa durante a navegação da página.
- Permitir busca, play direto nos cards e favoritos locais.
- Manter a página individual `/radio/:stationUuid` como fallback e experiência compartilhável.
- Preservar `/personalizar`, `/configure`, `/config` e todos os endpoints do addon.
- Manter a reprodução como stream direto da emissora, sem proxy ou retransmissão.

## Fora do escopo

- Contas, login, sincronização de favoritos ou banco de dados.
- Ranking proprietário de audiência sem fonte confiável.
- Conteúdo editorial/blog nesta etapa.
- Proxy, conversão, gravação ou distribuição dos streams.
- Aplicativo mobile nativo.

## Restrições e decisões

- Reutilizar Express, TypeScript, HTML renderizado no servidor e os assets existentes.
- Reutilizar `RadioBrowserClient`, normalização, ranking, gêneros, estados e cache já presentes.
- Não introduzir framework de frontend para esta entrega.
- Favoritos e estação atual ficam em `localStorage`; se estiver indisponível, a sessão continua utilizável.
- A política de segurança deve continuar permitindo apenas os domínios necessários para logos, fontes e streams diretos.
- O design atual escuro e roxo será refinado para uma linguagem de portal musical, mantendo a identidade RADIO BR.

## Abordagens consideradas

### Portal completo inspirado na referência — escolhido

Reorganiza a home em hero de descoberta, busca com filtros, trilho de rádios em destaque, blocos por gênero e região, favoritos e player global fixo. Aproveita a base de player e busca existente, adicionando dados agregados e uma camada de estado no navegador.

Trade-off: exige mudanças no endpoint de dados e nos templates/JS/CSS, mas entrega a experiência pretendida e deixa o addon preservado.

### Alteração enxuta

Manteria a estrutura institucional atual e adicionaria somente um player persistente e cards de busca.

Trade-off: menor risco, porém a home continuaria parecendo uma landing page de addon, não um portal de rádios.

### Aplicativo dedicado de streaming

Criaria uma navegação tipo app com fila, painel lateral e controles avançados.

Trade-off: melhor para uma futura plataforma de streaming, mas maior complexidade e não necessária para o objetivo atual.

## Experiência proposta

1. O topo apresenta a marca, navegação para “Mais ouvidas”, “Gêneros”, “Regiões” e “Personalizar”.
2. O hero destaca a proposta “Ouça rádios do Brasil ao vivo” e oferece busca imediata.
3. A busca aceita texto e filtros simples de gênero/estado; os resultados mostram logo, nome, localidade, codec/bitrate e ação de ouvir.
4. “Rádios em destaque” apresenta uma grade ou trilho horizontal com as estações editoriais/ranking já existentes.
5. “Por gênero” agrupa estações pelas definições atuais de `musicGenreDefinitions()`.
6. “Por região” usa estados/regiões brasileiras e deixa a pessoa iniciar uma busca filtrada.
7. Um player fixo no rodapé mostra logo, nome, estado, status ao vivo, controles nativos e botão de fechar; ao selecionar outra rádio, a fonte do mesmo elemento de áudio é trocada.
8. Favoritos são marcados por estação e aparecem em uma seção própria quando existirem.
9. A página individual continua oferecendo reprodução, informações e favorito, podendo compartilhar a rádio diretamente.
10. Um bloco discreto mantém a entrada para a central “Personalizar para Nuvio/Stremio”.

## Dados e servidor

- Adicionar uma resposta agregada para a home, ou endpoints específicos equivalentes, retornando estações serializadas com `id`, `name`, `favicon`, `homepage`, `state`, `codec`, `bitrate` e URL de reprodução quando necessário.
- Reutilizar o cache compartilhado para evitar consultas repetidas ao Radio Browser.
- Limitar quantidades por seção e evitar enviar dados desnecessários ao navegador.
- Garantir fallback amigável quando uma estação estiver sem logo, stream ou resposta do diretório.
- Manter as rotas do addon e o manifesto inalterados, salvo ajustes necessários para configurações do addon.

## Acessibilidade e responsividade

- Controles de áudio com nome acessível e estados `aria-pressed`/`aria-live` quando aplicável.
- Navegação por teclado e foco visível.
- Player reduzido em telas pequenas, sem cobrir conteúdo essencial.
- Respeito a `prefers-reduced-motion`.
- Imagens remotas com fallback e `alt` apropriado.

## Verificação

- Testes unitários para serialização/agregação de estações e renderização dos novos elementos.
- Testes de endpoint para a home/API e preservação das rotas do addon.
- Build, lint, formatação e suíte existente.
- Teste de interface para busca, iniciar rádio, trocar estação, favoritar e visualizar o player responsivo.

## O que ainda cabe ao implementador

- Escolher o formato exato do endpoint agregado conforme as APIs existentes.
- Definir o limite de estações por seção com base no custo das consultas.
- Implementar o layout, estado do player e testes sem alterar o contrato público do addon.
