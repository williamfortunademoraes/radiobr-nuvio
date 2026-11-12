# Relatório de compatibilidade — RADIO BR Fase 1

## Escopo

Este relatório separa testes do código do addon de reprodução real no Nuvio. Uma URL existente no Radio Browser não é evidência de que o player reproduz áudio.

## Testes automatizados

- Resultado atual: **10/10 testes aprovados**.
- Build TypeScript: **aprovado**.
- Fonte: fixture controlada em `tests/fixtures/station.ts`.
- Rede externa nos testes: **não utilizada**.

## Reprodução no Nuvio

| Plataforma            | MP3      | AAC/AAC+ | OGG      | HLS      | Duração | Evidência                 |
| --------------------- | -------- | -------- | -------- | -------- | ------- | ------------------------- |
| Nuvio — não executado | Pendente | Pendente | Pendente | Pendente | —       | Nenhuma coleta nesta fase |

Nenhuma compatibilidade de reprodução é declarada nesta entrega. A próxima validação deve usar algumas URLs reais brasileiras e registrar início, áudio sem vídeo, estabilidade por alguns minutos e falhas observadas por formato/plataforma.
