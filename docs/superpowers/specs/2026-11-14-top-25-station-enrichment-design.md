# Enriquecimento editorial das 25 rádios em destaque

## Intenção

Enriquecer as 25 rádios já cadastradas no addon com dados editoriais confiáveis: slogan, site oficial, URL do Radios.com.br e texto de apresentação (“Sobre”). O objetivo é que a página de cada rádio mostre informação útil sem alterar seu ID, stream ou disponibilidade.

## Escopo

- Adicionar `website` e `radiosComBrUrl` ao contrato de enriquecimento.
- Aplicar esses campos ao modelo normalizado e ao metadata retornado pelo addon.
- Criar um mapa curado para as 25 entradas do ranking atual.
- Preservar o `slogan` na posição atual da descrição.
- Usar o conteúdo editorial de `notes` como `about`, exibido como “Sobre”.
- Registrar a origem e a data de verificação dos campos.

Fora do escopo: cadastrar as posições 26–100, mudar streams, IDs, logos ou o ranking de audiência.

## Abordagens

1. Buscar os sites em tempo de execução: descartado por latência, bloqueios e instabilidade.
2. Persistir tudo em snapshot gerado automaticamente: útil para operação, mas insuficiente para manter fontes editoriais curadas no código.
3. Manter um mapa editorial versionado e integrá-lo ao enriquecimento existente: escolhido por centralizar as 25 fontes, permitir revisão por diff e manter fallback para Radio Browser.

## Decisões

- `website` será o site institucional/oficial da emissora ou rede, não a página de terceiros.
- `radiosComBrUrl` será mantido separadamente para atribuição e navegação secundária.
- O texto “Sobre” será curto, em português, e poderá registrar a praça, formato, programação ou posicionamento da emissora.
- Campos ausentes não serão preenchidos com valores inventados; o fallback existente continuará valendo.
- A resolução editorial terá precedência sobre dados genéricos do Radio Browser para esses campos.

## Verificação

Testes devem provar que os campos são preservados no merge, que o metadata publica o site oficial, que o slogan aparece antes da frequência e que o “Sobre” aparece depois dos dados de localização/gênero.
