# Central de personalização — plano de execução

Base inspecionada: `36cf6a4`, árvore limpa, SDK instalado 1.6.10, 85 testes aprovados.

1. Preservar a página e o wizard existentes; validar HTML, CSS e interação real.
2. Usar JSON percent-encoded nativo do SDK. Manter `getRouter` para recursos e manifesto dinâmico antes dele: `serveHTTP` não oferece manifesto por configuração.
3. Adicionar regressões de validação, manifesto, seleção múltipla, estados, logotipos, cache e streams. Corrigir somente as lacunas demonstradas.
4. Gerar URL canônica no servidor usando `ADDON_BASE_URL`; rejeitar configurações inválidas em todos os endpoints personalizados.
5. Preservar os catálogos padrão; restringir os regionais aos estados selecionados quando houver filtro. Curadoria com filtro estadual usa somente o estado informado pela Radio Browser.
6. Executar testes, build, lint e formatação. Verificar o servidor compilado e interface desktop/mobile.
7. Validar Nuvio somente em ambiente experimental identificável; nunca alterar perfil principal. Registrar bloqueios e evidências sem declarar reprodução apenas por HTTP.

Sem commit, push ou deploy. Sem banco, conta, proxy de áudio ou inferência de cidade. A seleção de gêneros controla suas coleções; destaque e catálogo geral mantêm seu escopo e respeitam estados. Filtros operam no lote compartilhado de até 100 estações, limitação existente que deve permanecer explícita.
