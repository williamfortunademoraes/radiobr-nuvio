# Fase 2.1 — entrega local

Implementados nome de apresentação e catálogo `radio-br-featured`. Catálogo original, IDs, versão, metadados e streams preservados. Ranking puro por popularidade, sinal positivo de disponibilidade, completude, URL resolvida e UUID; deduplicação após ordenação. Ranking limitado ao lote retornado (até 100), não a todo o diretório. Ambas as visões usam a mesma consulta e cache TTL existente; requisições simultâneas ainda não são coalescidas.

Criado `assets/logo.svg`, original. O SDK instalado recomenda PNG para logo e PNG/JPG para background. Por segurança, o SVG não foi ligado ao manifest; logo/background publicados e renderização no Nuvio permanecem pendentes. Nenhum asset de terceiros foi utilizado.

## Teste local no PowerShell

```powershell
$env:PORT='7002'
npm run dev
```

Manter o terminal aberto. Manifest: `http://127.0.0.1:7002/manifest.json`. Testar em perfil separado do Nuvio: o ID técnico é o mesmo, portanto instalar no perfil habitual pode substituir a instalação existente. Não remover o addon funcional. Em perfil separado, adicionar a URL em Configurações/Mídia e verificar os catálogos Rádios em destaque e Rádios do Brasil. Conferir o nome Estações de rádios - Brasil. A nova interface não foi observada no Nuvio nesta entrega.

Endpoints: `/catalog/tv/radio-br-featured.json` e `/catalog/tv/radio-br-catalog.json`. A presença de URL ou lastcheckok positivo não garante reprodução.

Testes: 14 casos novos de ranking e 10 testes anteriores, com expectativa do manifest atualizada para o novo nome e catálogo. Sem novas dependências, commit ou publicação.
