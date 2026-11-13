# Logo de FM O Dia — design

## Intenção

Exibir a logo curada já versionada para a estação que o Radio Browser entrega como `FM O DIA 100.5` na coleção Sudeste.

## Escopo

- Normalizar o nome da estação exclusivamente para consultar o mapa de logos curadas.
- Manter a ordem atual: logo curada, favicon da estação e pôster padrão.
- Não alterar nomes exibidos, streams, filtros regionais ou os arquivos de imagem.

## Abordagens

1. Adicionar uma segunda chave literal ao mapa. Resolve somente esta grafia e repete dados.
2. Normalizar as chaves e o nome consultado. Escolhida: cobre diferenças de caixa, acentos e o prefixo `Rádio` sem duplicar entradas.

## Verificação

Um teste do catálogo deverá provar que `FM O DIA 100.5` recebe `fm-o-dia-100-5.png`; a suíte, lint e build devem continuar verdes.
