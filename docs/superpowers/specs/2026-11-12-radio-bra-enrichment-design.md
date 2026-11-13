# RADIO BRA — enriquecimento automático do catálogo

## Intenção

Enriquecer os registros já identificados pelo Radio Browser com nome, cidade, UF, nome do estado, categorias, slogan e logo, preservando os IDs `radio-br:<stationuuid>`, streams e contratos do Nuvio/Stremio.

## Escopo e não objetivos

O trabalho adiciona uma rotina modular de coleta e atualização de dados. Não cria frontend, painel, banco externo, novo catálogo ou sistema de reprodução. A rotina será executável sob demanda e produzirá um snapshot local; agendamento automático ficará a cargo do ambiente que executar o comando.

## Abordagens consideradas

1. Consultar todos os sites durante cada requisição do catálogo: rejeitada por latência, instabilidade, rate limits e dependência externa no Nuvio.
2. Criar um serviço/banco separado: rejeitada por ampliar a arquitetura e a operação do projeto.
3. Coleta offline modular com snapshot local consumido pelo catálogo: escolhida por ser idempotente, testável, compatível e permitir atualização sem alterar os contratos atuais.

## Fontes e prioridade

Radios.com.br será consultado primeiro; o site oficial será usado para completar ou atualizar informações; Radio Browser permanece fonte complementar e base de identidade/stream; fontes públicas verificáveis só entram com proveniência registrada. Conflitos serão resolvidos por prioridade, atualidade e validação, sem substituir dado confiável por dado inferior.

## Identidade e modelo

O `stationUuid` existente é a chave principal. A associação secundária exige URL oficial ou combinação de nome normalizado, cidade, UF e frequência; nome isolado nunca cria identidade. O modelo `Station` preserva `favicon` como campo de apresentação compatível, acrescenta dados canônicos somente quando não houver equivalente e mantém proveniência separada no snapshot.

## Execução

Adaptadores recebem um cliente HTTP injetável com timeout, retry limitado, backoff e limite de concorrência. HTML e imagens serão validados antes de serem aceitos. Falhas individuais serão registradas e não interromperão a coleta das demais emissoras.

## Logos

Logos oficiais terão prioridade sobre favicon. A URL precisa responder como imagem e atingir a resolução mínima definida pelo validador. Logos fornecidos pelo usuário ou encontrados em fontes públicas serão registrados com origem e licença/status; imagens restritas não serão incorporadas automaticamente.

## Compatibilidade

O snapshot será opcional: sem dados enriquecidos, o catálogo atual continua funcionando. Streams, IDs, rotas `tv`, filtros e reprodução permanecem inalterados. Campos ausentes permanecem ausentes, sem slogans, cidades, categorias ou logos inventados.
