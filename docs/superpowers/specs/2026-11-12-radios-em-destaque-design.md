# Rádios em Destaque — desenho de implementação

## Intenção

Adicionar ao addon RADIO BR uma coleção editorial nacional/regional chamada `radios-em-destaque`, com 13 emissoras cadastradas em arquivo versionado. A coleção deverá enriquecer os metadados consumidos pelo Nuvio sem criar frontend, banco, painel ou um sistema de reprodução paralelo.

## Objetivos

- Preservar manifestos, endpoints e IDs atuais.
- Separar a ordenação editorial da classificação automática do Radio Browser.
- Reutilizar busca, normalização, identificação e resolução de streams existentes.
- Expor logos, fonte dos logos, website, frequência e localização quando confirmados.
- Representar ausência de dados explicitamente e impedir que estação sem stream validado pareça reproduzível.
- Deixar a apresentação visual e a administração sob responsabilidade futura do Nuvio.

## Fora do escopo

- Frontend, cards HTML/CSS ou alteração da página inicial do Nuvio.
- Banco de dados, endpoints administrativos ou edição em runtime.
- Proxy/conversão de áudio.
- Inferência de frequência, localização, logo ou URL de stream.
- Refatoração ampla dos contratos existentes.

## Abordagens consideradas

1. **Arquivo editorial versionado integrado ao addon — escolhida.** Mantém a arquitetura atual, permite revisão por código e reutiliza os serviços existentes. A edição exige alteração de arquivo e nova publicação.
2. **Banco e painel administrativo.** Permitiria edição dinâmica, mas introduziria infraestrutura, segurança e responsabilidades inexistentes no addon.
3. **Frontend separado.** Atenderia cards e controles visuais, mas não pertence a este repositório nem ao contrato do addon.

## Desenho

- `src/editorial/radios-em-destaque.ts` conterá a definição ordenada da coleção, seus metadados e referências de fonte.
- O modelo interno de estação receberá campos opcionais de apresentação e origem, sem duplicar `homepage`/`favicon` quando os dados vierem do Radio Browser.
- Um resolvedor editorial buscará estações no catálogo existente, por identificador estável quando possível e por normalização controlada como fallback; nunca fabricará uma estação ou stream.
- O catálogo `radios-em-destaque` retornará os 13 itens na ordem editorial. Itens sem correspondência ou stream continuarão visíveis, mas a metadata indicará indisponibilidade.
- O handler de streams aceitará apenas IDs de estação já encontrados e URLs consideradas válidas pelo fluxo atual.
- A coleção será configurável no arquivo por `enabled` e `showOnHome`; o addon continuará compatível com clientes que não conhecem esses campos.
- Logos usarão `poster`/`posterShape: square` no contrato Stremio, preservando a URL original e a origem em campos de metadata/descrição apropriados para o Nuvio.

## Fonte e atualização

Os dados serão conferidos contra `https://radiosbrasil.com.br/radios-mais-ouvidas/` e páginas individuais quando disponíveis. A origem será registrada por item. Frequências, websites e streams ausentes permanecerão `undefined`; URLs de páginas não serão tratadas como URLs de reprodução.

## Verificação

Adicionar testes para ordenação e visibilidade editorial, enriquecimento/fallback de logos, deduplicação, dados incompletos e streams somente para estações resolvidas. Executar `npm test`, `npm run lint` e `npm run build`.
