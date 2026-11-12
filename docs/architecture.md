# Arquitetura

`radio-browser` concentra HTTP, parâmetros obrigatórios e cache TTL. `stations` normaliza a resposta externa em um modelo interno e elimina registros não brasileiros, quebrados ou sem URL.

`catalog`, `metadata` e `streams` transformam o modelo interno nos contratos do protocolo. `addon` compõe esses serviços com `addonBuilder` do `stremio-addon-sdk` 1.6.10. O cliente recebe `fetch` e cache por injeção, permitindo testes sem rede.

Não há frontend, banco, catálogo manual, proxy ou conversão de áudio.
