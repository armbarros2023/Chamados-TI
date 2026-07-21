# Plano aprovado — Sistemas e operação de atendimento

**Status:** desenho validado para implementação
**Data:** 20 de julho de 2026

## Objetivo

Classificar cada chamado por sistema atendido, tornar a fila mais fácil de operar e exibir, no painel administrativo, os chamados resolvidos no mês por sistema. A mudança deve preservar os chamados existentes, não ampliar permissões e ser publicada de forma reversível.

## Escopo aprovado

- Campo obrigatório `Sistema` ao abrir um chamado.
- Sistemas controlados: AceData, Computador, Fluig, Internet, Protheus, WebMail e Windows 11.
- Painel administrativo com os sete logos nessa ordem e a quantidade de chamados resolvidos no mês vigente.
- Período mensal calculado no servidor, no fuso `America/Sao_Paulo`, do primeiro ao último dia do mês.
- Filtros de fila por sistema, departamento, status e período; busca por número, título e solicitante.
- Validação de autorização administrativa explícita nas rotas críticas e testes de regressão.
- Atualização coordenada da web e dos instaladores macOS, Windows e Android.

## Regras de dados

- O banco terá um campo de sistema com valores permitidos. A mesma lista será usada no frontend e validada pela API.
- Chamados antigos ficarão como `Não classificado`; não entram na soma de nenhum dos sete logos.
- Uma métrica mensal só conta chamados com status `resolvido` e `closed_at` dentro do mês calendário atual.
- A rota de métricas permanece acessível somente a administradores.

## Experiência de uso

- O campo Sistema será exibido ao lado de Categoria e Departamento, com rótulo e mensagem de validação claros.
- Cada logo terá nome textual, contagem e período de referência; não dependerá somente da imagem para comunicar seu conteúdo.
- Selecionar um logo aplicará o filtro correspondente à fila.
- A tabela continuará paginada, mas filtros e pesquisa serão processados pela API para manter resultados corretos em bases maiores.
- Se métricas falharem, a fila continuará utilizável e oferecerá nova tentativa.

## Implantação e validação

1. Criar migration não destrutiva, preencher o estado dos registros antigos e criar os índices necessários.
2. Aplicar a mudança em staging após backup validado do banco e dos anexos.
3. Testar criação válida e inválida, acesso administrativo, filtros, limites de mês, responsividade e erros de carregamento.
4. Executar `npm run verify`, testes de navegação e auditorias aplicáveis.
5. Atualizar a aplicação web e os instaladores na mesma versão; versões antigas receberão erro claro caso não enviem o campo obrigatório.
6. Publicar em produção somente após validação em staging; manter a versão anterior disponível para rollback.

## Fora desta entrega

- SLA, prazos e alertas de atraso.
- Atribuição de responsável técnico ou equipe.
- Linha do tempo completa de auditoria e pesquisa de satisfação.
- Notificações adicionais por mudança de status.
- Processamento de anexos grandes em armazenamento externo e varredura antimalware.

## Registro de decisões

| Decisão | Alternativas consideradas | Motivo |
| --- | --- | --- |
| Lista fixa de sistemas | Reaproveitar categoria; criar CRUD de sistemas | Mantém a classificação confiável sem abrir escopo administrativo desnecessário. |
| Logos como métricas e filtros | Logos apenas decorativos | Acelera a triagem sem adicionar outra tela. |
| Métricas no servidor e por mês calendário | Contagem no navegador; últimos 30 dias | Evita resultados parciais e atende exatamente à regra do dia 1 ao último dia do mês. |
| Publicação coordenada | Alterar somente a API | Evita criação de chamados incompletos por clientes antigos. |

## Riscos reconhecidos

- Clientes instalados antes desta versão deverão ser atualizados para abrir novos chamados após a regra obrigatória entrar em vigor.
- Arquivos de mídia fornecidos serão transformados em derivados otimizados, sem alterar os originais.
- Nenhuma alteração será enviada à produção sem backup, staging validado e aprovação de publicação.
