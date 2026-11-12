# Rádios em Destaque

O addon expõe a coleção editorial `radios-em-destaque` como catálogo `tv`. Ela é independente do ranking automático `radio-br-featured` e mantém 13 itens em ordem manual.

## Dados

Os registros ficam em `src/editorial/radios-em-destaque.ts`, versionados junto do código. Cada item possui ID estável, nome, categoria, referência da fonte e campos opcionais para logo, origem, website, frequência, cidade, estado, estação Radio Browser e stream.

Dados não confirmados permanecem ausentes. A página de referência é `https://radiosbrasil.com.br/radios-mais-ouvidas/`; os logos preenchidos apontam para os ativos publicados pelo portal e registram essa página em `logoSource`. URLs de páginas nunca são tratadas como URLs de reprodução.

## Resolução e reprodução

O addon consulta o Radio Browser pelo cliente existente, normaliza as estações e tenta associá-las por `stationId` ou nome normalizado. Uma entrada editorial sem correspondência continua no catálogo, mas recebe a indicação de indisponível e retorna `streams: []`. Quando há correspondência, a reprodução reutiliza `urlResolved` ou `url` do fluxo existente.

O Nuvio pode usar `poster`, `description`, `website` e o ID `radio-br:editorial:<id>` para decidir como apresentar os cards. Quando o logo editorial não existe, o favicon real da estação é usado; se nenhum dos dois existir, o cliente deve aplicar seu fallback visual.

## Atualização editorial

Para alterar ordem, visibilidade ou itens, edite o arquivo editorial e publique uma nova versão do addon. `enabled` controla a exposição do catálogo e `showOnHome` fica disponível para o Nuvio decidir a apresentação na página inicial. Não há banco nem painel administrativo neste addon.

## Compatibilidade

Os catálogos, IDs e handlers existentes permanecem ativos. A coleção editorial não cria um segundo sistema de reprodução e não altera o contrato de estações `radio-br:<uuid>`.
