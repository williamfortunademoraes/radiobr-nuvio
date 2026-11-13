# Catálogo e metadados das rádios — design

## Intenção

Simplificar a navegação do RADIO BR e melhorar a ficha individual da rádio no Nuvio/Stremio, mantendo o contrato técnico do addon compatível com os clientes.

## Escopo

- Manter somente a coleção editorial com 13 rádios em destaque; remover a coleção de ranking automático.
- Fundir Notícias e Esportes em uma categoria/coleção única.
- Fundir Samba e Pagode em uma categoria única.
- Fazer “Outros gêneros” absorver também estações sem gênero informado.
- Retirar “TV” e referências explícitas a país/idioma dos nomes e descrições visíveis. O tipo técnico `tv` permanece nos endpoints porque é necessário ao contrato atual de reprodução.
- Melhorar os metadados individuais com nome, pôster, descrição organizada e website.

## Metadados individuais

A descrição será texto simples compatível com Nuvio e Stremio, organizada em linhas:

```text
Cidade: [Rio de Janeiro](https://radiosbrasil.com.br/cidades/rio-de-janeiro/)
Estado: [RJ](https://radiosbrasil.com.br/estados/rj/)
Gênero: [Hits](https://radiosbrasil.com.br/generos/hits/), [Popular](https://radiosbrasil.com.br/generos/popular/)
Formato: MP3 · 128 kbps
```

Cidade será usada somente quando vier como dado confiável da fonte; não será inferida pelo nome, domínio ou telefone. País e idioma não serão exibidos. Tags genéricas e relacionadas a país serão excluídas da linha de gêneros. Os links em Markdown são best-effort: clientes que não renderizarem Markdown ainda receberão a informação legível.

## Abordagens consideradas

1. **Texto/Markdown compatível (escolhida):** funciona como descrição em ambos os clientes e permite links quando suportados.
2. **HTML na descrição:** aproxima mais o layout visual de um site, mas pode ser escapado ou ignorado pelo Nuvio/Stremio.

A abordagem escolhida evita depender de recursos de renderização não garantidos pelo protocolo.

## Implementação

- Atualizar definições, aliases, agrupamento e IDs expostos pelo manifesto.
- Atualizar página de personalização, textos da landing page e controles de coleções para refletir as novas categorias.
- Limitar a coleção editorial às 13 entradas já versionadas e remover o catálogo de ranking automático da configuração padrão e das configurações geradas.
- Adicionar cidade opcional ao modelo de estação caso a fonte a forneça, sem alterar dados ausentes.
- Criar helpers puros para slug de URL e composição da descrição, com testes unitários.
- Atualizar testes de classificação, agrupamento, manifesto, personalização e metadados.

## Não objetivos

- Recriar no addon o player, favoritos, botões sociais ou sidebar do site de referência.
- Alterar URLs de stream, IDs de estações ou o tipo técnico dos endpoints.
- Inferir cidade, gênero ou idioma a partir de campos não confiáveis.
