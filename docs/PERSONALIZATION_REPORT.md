# RADIO BR — Central de personalização

## Escopo e estado inicial

Inspeção em 12/11/2026: branch `main`, commit `36cf6a4`, árvore limpa. O workspace já continha página, wizard, configurações, gêneros, estados e curadoria. A versão publicada ainda mostrava a página genérica do SDK. Foram preservados os recursos existentes e corrigidas lacunas do fluxo, sem substituir o addon por um aplicativo independente.

## Entrega

- Página escura com violeta, identidade RADIO BR, hero, coleções e links.
- Central em cinco etapas, seleção múltipla de gêneros e UFs, revisão e geração.
- URL canônica produzida no servidor e manifesto JSON dinâmico, sem conta ou banco.
- Cópia, manifesto visível, link `stremio://` e instruções manuais para Nuvio.
- Validação em todos os recursos personalizados; limites de 2 KiB, versão e listas permitidas.
- Estados respeitados inclusive na curadoria; coleções não selecionadas não são retornadas.
- Preferência de logotipos também aplicada aos detalhes das emissoras.
- Cache compartilhado e deduplicação de consultas simultâneas, sem alteração das URLs de áudio.

## Protocolo investigado

SDK instalado: 1.6.10. Inspecionados `getRouter.js`, `serveHTTP.js` e a documentação oficial via Context7. O SDK reconhece JSON percent-encoded na URL e entrega `args.config`; exige `manifest.config` para ativar o prefixo opcional. `behaviorHints.configurable` anuncia a página `/configure`. O router serializa um manifesto fixo: o projeto fornece o manifesto dinâmico antes de delegar recursos ao router oficial.

Referências: [manifest/config](https://github.com/Stremio/stremio-addon-sdk/blob/v1.6.10/docs/api/responses/manifest.md), [router](https://github.com/Stremio/stremio-addon-sdk/blob/v1.6.10/src/getRouter.js), [serveHTTP](https://github.com/Stremio/stremio-addon-sdk/blob/v1.6.10/src/serveHTTP.js).

## Compatibilidade e limites

Validação local final: 113 testes do serviço aprovados; 3 testes de navegador aprovados (390 px, 1440 px e seleção vazia/resultado antigo); build, lint e format:check aprovados. Os testes de interface executaram `node dist/src/index.js`, sem usar o servidor de desenvolvimento. Capturas locais: `output/playwright/wizard-390.png` e `output/playwright/wizard-1440.png`.

| Item                                | Evidência / limite                                            |
| ----------------------------------- | ------------------------------------------------------------- |
| Manifesto padrão e personalizado    | Testes HTTP pelo servidor real                                |
| Preferências persistidas por URL    | Serialização canônica, nova leitura da mesma URL              |
| Catálogos, metadados, streams       | Testes com fixtures, IDs e URLs preservados                   |
| Página / wizard desktop e mobile    | Testes de navegador sobre build de produção                   |
| Nuvio: instalação personalizada     | Pendente de perfil experimental identificado                  |
| Reprodução real após personalização | Pendente; HTTP não comprova áudio no player                   |
| Link direto Nuvio                   | Não anunciado, protocolo não confirmado                       |
| Logotipos                           | O addon omite poster; Nuvio pode mostrar substitutos          |
| Cidades                             | Indisponíveis; contrato v1 rejeita cidade                     |
| Cobertura estadual                  | Somente campo state; sem inferência por nome/domínio/telefone |
| Cobertura do diretório              | Filtros sobre lote de até 100 estações, não todo o diretório  |

O Nuvio foi localizado aberto, mas sua árvore de acessibilidade não identifica o perfil ativo. Nenhuma instalação foi alterada nesta validação. Relatórios anteriores sobre AAC/AAC+ não comprovam este fluxo personalizado. Para finalizar: selecionar perfil de teste, instalar URL com destaque/Sertanejo/Gospel/RJ/SP, conferir coleções, reiniciar/reinstalar pela mesma URL e registrar reprodução por formato. Nunca substituir o perfil principal.

## Hospedagem

Serviço existente: `https://radiobr-nuvio.onrender.com`. Build `npm ci && npm run build`, start `npm start`, `ADDON_BASE_URL=https://radiobr-nuvio.onrender.com`. `PORT` vem do Render. Assets permanecem na raiz do repositório. Verificar homepage, `/personalizar`, `/manifest.json` e URL gerada após publicação.

Publicação autorizada posteriormente pelo usuário com “Pode subir tudo”.
