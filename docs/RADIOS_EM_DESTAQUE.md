# Destaques Top 25

O catálogo técnico `radios-em-destaque` expõe exatamente 25 posições do ranking nacional de FM do Radios.com.br, preservando a ordem editorial da fonte. A fotografia versionada atual corresponde ao período `2026-07`.

## Dados

Os dados ficam em `src/editorial/top-25-ranking.ts`, separados do catálogo Radio Browser. O cruzamento é feito por `src/editorial/top-25-match.ts`, usando nome normalizado e UF explícita. A localização não é inferida pelo nome da emissora.

Uma posição sem correspondência continua visível no catálogo com indicação de indisponibilidade. Ela não é substituída por outra rádio. A lista contém a URL da fonte e está preparada para receber uma nova fotografia do ranking em atualização futura.

## Resolução e reprodução

Quando existe correspondência, logo, identificador e URL de reprodução continuam vindo do registro normalizado do Radio Browser. A página de metadata apresenta cidade, estado e gênero como links do Radios Brasil quando esses dados existem; país, idioma e termos de TV não são exibidos.

O identificador das posições é `radio-br:editorial:top25-{posição}`. A reprodução das emissoras encontradas continua usando o fluxo existente `urlResolved` ou `url`.

## Atualização editorial

Para atualizar o ranking, substitua a fotografia em `top-25-ranking.ts`, mantendo posições, período, fonte e a estrutura de correspondência. Não há banco nem painel administrativo neste addon.

## Compatibilidade

Os catálogos, IDs e handlers existentes permanecem ativos. A coleção editorial não cria um segundo sistema de reprodução e não altera o contrato de estações `radio-br:<uuid>`.
