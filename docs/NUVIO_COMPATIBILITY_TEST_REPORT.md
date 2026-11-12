# RADIO BR — Relatório de testes de compatibilidade com o Nuvio

Data da execução: 11/11/2026  
Addon: RADIO BR 0.1.0  
Nuvio: 1.1.35  
Plataforma: Windows 11 x64, aplicativo desktop `C:\Program Files\Nuvio\Nuvio.exe`

## 1. Método de instalação

O addon foi executado com `npm run dev` e disponibilizou:

`http://127.0.0.1:7000/manifest.json`

O Nuvio foi aberto em Configurações → Mídia. A tela exibiu o campo “URL do Addon”. O manifest local foi inserido e instalado com sucesso. O Nuvio mostrou:

- RADIO BR;
- versão 0.1.0;
- 3 recursos;
- 1 catálogo;
- catálogo do tipo TV.

A documentação consultada descreve a instalação por URL de manifest em Configurações → Addons. A documentação não foi usada para presumir aceitação de loopback; a aceitação foi efetivamente observada nesta instalação local.

## 2. Funcionalidades do addon observadas

| Item                | Resultado   | Evidência                                                                      |
| ------------------- | ----------- | ------------------------------------------------------------------------------ |
| Manifest            | Aprovado    | Nuvio instalou e exibiu RADIO BR 0.1.0                                         |
| Catálogo            | Aprovado    | “Rádios do Brasil - TV” apareceu com estações reais                            |
| Pesquisa            | Não testado | Não houve teste concluído da busca na interface                                |
| IDs estáveis        | Aprovado    | Catálogo exibiu IDs `radio-br:<stationuuid>` nas respostas locais              |
| Metadados           | Aprovado    | Posters e nomes foram exibidos no catálogo; detalhe individual não foi isolado |
| Stream direto       | Aprovado    | Player abriu com fonte “RADIO BR”                                              |
| Fixture em uso real | Aprovado    | O catálogo real retornou estações da API Radio Browser                         |

## 3. Estações selecionadas para a conclusão

As estações abaixo foram selecionadas dinamicamente a partir da Radio Browser API em 11/11/2026, com `countrycode=BR`, `hidebroken=true`, ordenação por acessos e codec declarado. Elas são candidatas para teste manual; a seleção e os headers HTTP não constituem aprovação de reprodução no Nuvio.

| Formato | Estação                  | stationuuid                            | URL `url_resolved`                                                                        | Resultado HTTP verificável                                                    |
| ------- | ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| MP3     | BR - The Classic Rock    | `195f2990-e0d3-4b34-8aab-5b173ddb6c6e` | `https://stream.zeno.fm/nbq1aq62gd0uv`                                                    | 302 para endpoint `surfernetwork.com`, depois 200 `audio/mpeg`, `icy-br: 128` |
| AAC     | Rádio Jovem Pan 100.9 FM | `8e9b5ba4-dcc1-4dad-8ddf-e7cc04c33a00` | `https://stream.zeno.fm/c45wbq2us3buv`                                                    | 302 para endpoint `surfernetwork.com`, depois 200 `audio/aac`, `icy-br: 128`  |
| AAC+    | Rádio FM O Dia 99.7 FM   | `4317dca3-9e67-4226-82a8-8f650ba50219` | `https://wz7.servidoresbrasil.com:8274/stream`                                            | URL cadastrada; headers não coletados nesta preparação                        |
| OGG     | Sertanejo Rádio          | `3b6242c7-dc73-4a46-ac59-c32d77f24bad` | `https://stream.sertanejoradio.com.br/listen/sertanejoradio/live`                         | 200 `application/ogg`, `icy-br: 96`                                           |
| HLS     | bandnews fm sp           | `4a17b7fa-42a0-4c32-bdc6-dc1c59066c96` | `https://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC.m3u8` | 302 para playlist HLS, depois 200 `application/vnd.apple.mpegurl`             |

Os redirects foram observados com requisições HTTP controladas e User-Agent descritivo. O candidato MP3 “Smooth Jazz Lounge” retornou 502 durante a verificação e não foi selecionado como candidato principal.

A sessão anterior do Nuvio utilizada para reprodução abriu:

- Rádio FM O Dia 99.7 FM — declarado pela API como AAC+, 128 kbps, URL `https://wz7.servidoresbrasil.com:8274/stream`;
- Rádio Transamérica 100.1 FM — exibida pelo player como AAC.

O player do Nuvio exibiu o rótulo AAC e áudio estéreo 2.0. A identificação exibida pelo player é evidência do que o Nuvio reportou; não foi feita inspeção de bytes do stream.

MP3, OGG e HLS ainda não tiveram reprodução no Nuvio nesta etapa. Não são considerados aprovados.

## 4. Matriz de resultados

Resultados permitidos: Aprovado, Falhou, Não testado, Inconclusivo.

| Estação                     | Formato                      | Plataforma                     | Catálogo    | Metadados   | Iniciou áudio | Sem vídeo   | 5 min estáveis |
| --------------------------- | ---------------------------- | ------------------------------ | ----------- | ----------- | ------------- | ----------- | -------------- |
| Rádio FM O Dia 99.7 FM      | AAC+ declarado / AAC exibido | Nuvio Desktop 1.1.35 / Windows | Aprovado    | Aprovado    | Aprovado      | Aprovado    | Aprovado       |
| Rádio Transamérica 100.1 FM | AAC exibido                  | Nuvio Desktop 1.1.35 / Windows | Aprovado    | Aprovado    | Aprovado      | Aprovado    | Não testado    |
| BR - The Classic Rock       | MP3                          | Nuvio Desktop 1.1.35 / Windows | Não testado | Não testado | Não testado   | Não testado | Não testado    |
| Rádio Jovem Pan 100.9 FM    | AAC                          | Nuvio Desktop 1.1.35 / Windows | Não testado | Não testado | Não testado   | Não testado | Não testado    |
| Sertanejo Rádio             | OGG                          | Nuvio Desktop 1.1.35 / Windows | Não testado | Não testado | Não testado   | Não testado | Não testado    |
| bandnews fm sp              | HLS                          | Nuvio Desktop 1.1.35 / Windows | Não testado | Não testado | Não testado   | Não testado | Não testado    |

## 5. Evidências observáveis

- A tela de addons exibiu RADIO BR instalado, ativo, com 3 recursos e 1 catálogo.
- A tela inicial exibiu a seção “Rádios do Brasil - TV” com logos e nomes reais.
- O player exibiu “RADIO BR” como fonte, “AAC”, “2.0”, volume ativo e botão “Pausar”.
- Durante a primeira sessão, o progresso avançou de aproximadamente `01:18` para `02:05`.
- A sessão foi interrompida por troca manual de estação antes do requisito de cinco minutos.
- Em uma sessão posterior sem troca manual, a mesma estação permaneceu em reprodução até aproximadamente `06:45`, com estado “Pausar”, fonte RADIO BR, AAC e áudio 2.0.

Não foi possível provar auditivamente o áudio por ferramenta automatizada; a observação visual do player indica reprodução iniciada, mas não substitui uma confirmação humana do som.

## 6. Procedimento reproduzível para o teste manual

Para cada candidato, sem trocar de estação durante o teste:

1. Iniciar o addon com `npm run dev` e confirmar `http://127.0.0.1:7000/manifest.json`.
2. No Nuvio Desktop 1.1.35 para Windows, confirmar RADIO BR ativo em Configurações → Mídia.
3. Abrir “Rádios do Brasil - TV” e localizar a estação pelo nome.
4. Abrir os detalhes e confirmar nome, logotipo e informações disponíveis.
5. Acionar reprodução e registrar se o player inicia, se há áudio audível e se não há vídeo.
6. Registrar o relógio de início e manter a mesma estação por pelo menos cinco minutos.
7. Observar o player sem trocar de estação; registrar interrupções, retorno ao catálogo, erros ou perda de áudio.
8. Ao completar cinco minutos, registrar **Aprovado** somente se áudio continuar audível e sem vídeo; caso contrário, usar **Falhou** ou **Inconclusivo** conforme a evidência.
9. Repetir separadamente para MP3, AAC/AAC+, OGG e HLS.

Uma troca manual de estação interrompe o teste e deve ser registrada como **Inconclusivo**, sem classificar a interrupção como falha técnica.

## 7. Diagnóstico

O fluxo de descoberta, catálogo, metadados básicos e resolução de stream funcionou no Nuvio Desktop para o addon local. A reprodução de áudio puro iniciou em uma estação AAC/AAC+, sem vídeo aparente.

A primeira sessão foi interrompida manualmente pela troca de estação antes de completar cinco minutos e permanece **Inconclusiva**, sem falha técnica observada. Em uma sessão posterior, sem troca manual, a estação permaneceu ativa por aproximadamente 6:45; portanto, a estabilidade AAC/AAC+ nesta sessão foi **Aprovada**.

Não foram observadas falhas de descoberta do addon, catálogo ou resolução do stream nessa sessão.

## 8. Compatibilidade comprovada

Compatibilidade comprovada apenas para:

- instalação do manifest local no Nuvio Desktop 1.1.35 em Windows;
- apresentação do catálogo TV;
- abertura do player por um stream AAC/AAC+ retornado pelo RADIO BR;
- início observável de reprodução sem vídeo aparente.

Não está comprovada compatibilidade geral, estabilidade por cinco minutos, MP3, OGG, HLS, Android, Android TV, iOS ou outras plataformas.

## 9. Limitações e pendências

- Os resultados HTTP confirmam acesso, redirects e Content-Type, mas não confirmam reprodução no Nuvio.
- MP3, OGG e HLS selecionados aguardam execução manual na matriz. A sessão AAC/AAC+ da Rádio FM O Dia foi aprovada por aproximadamente 6:45.
- Não foram testadas outras plataformas além do Nuvio Desktop 1.1.35 no Windows.
- Não houve alteração no código do addon ou no código-fonte do Nuvio.

## 10. Recomendação

Manter o projeto na Fase 1. Antes de qualquer expansão, completar a matriz com estações MP3, OGG e HLS e capturar evidências de cinco minutos para cada formato.

Nenhuma funcionalidade da Fase 2 foi iniciada. Este relatório está preparado para receber os resultados dos testes manuais do usuário.
