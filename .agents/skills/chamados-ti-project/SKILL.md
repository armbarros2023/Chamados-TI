---
name: chamados-ti-project
description: Contexto operacional e decisões do projeto Chamados-TI. Use sempre que o usuário mencionar Chamados-TI, Chamados_TI, Suporte Chemisch, o preview local nas portas 5173/3002, a modernização web/PWA, Tauri, Capacitor ou a continuidade do plano de melhorias deste helpdesk.
---

# Chamados TI Project

## Começar pelo contexto correto

1. Trabalhar em `/Users/arbtechinfo/Projetos CC/Chamados-TI`.
2. Confirmar o caminho antes de editar; a pasta não é um repositório Git independente e o status do repositório pai é ruidoso.
3. Ler `PROJETO_MELHORIAS.md` antes de qualquer mudança estrutural ou visual e `PLANO_SISTEMAS_E_ATENDIMENTO.md` antes de alterar a classificação por sistemas, os logos ou os filtros.
4. Ler [references/project-state.md](references/project-state.md) quando precisar do estado técnico, runtime local ou decisões já aprovadas.
5. Ler `../chamados-ti-creation-history/references/creation-history.md` quando precisar da cronologia completa e das evidências recentes.
6. Preservar arquivos e mudanças existentes. Não limpar `node_modules`, `dist`, `build` ou o banco sem pedido explícito.

## Respeitar o estágio aprovado

- Tratar `PROJETO_MELHORIAS.md` como a especificação vigente.
- Não iniciar migração para monorepo, PWA ou Expo sem autorização expressa para implementação.
- Quando autorizado, começar pela Fase 0: proteger a base, documentar contratos, criar testes mínimos e produzir protótipo navegável.
- Manter o sistema atual operável enquanto a modernização avança.

## Operar o preview local

1. Verificar PostgreSQL com `brew services list` e iniciar `postgresql@16` apenas se necessário.
2. Iniciar a API em `backend/` com `npm run dev`.
3. Iniciar o frontend na raiz com `npm run dev -- --host 127.0.0.1`.
4. Abrir `http://127.0.0.1:5173/` e validar a tela visível.
5. Confirmar autenticação pela API antes de atribuir falhas ao frontend.

Não persistir senhas, tokens, JWT secrets ou URLs privadas nesta skill. O ambiente possui um administrador local de demonstração; consultar ou redefinir sua senha no banco somente quando o usuário solicitar.

## Aplicar as decisões de produto

- Web responsiva e PWA instalável.
- Windows/macOS com Tauri e Android/iOS com Capacitor para maximizar o reaproveitamento do frontend.
- A versão de teste multiplataforma atual é `0.1.2`: Android usa Capacitor/Keystore, Windows usa Tauri/Credential Manager e iOS usa Capacitor/Keychain. Todos apontam apenas para a API HTTPS de staging.
- O projeto iOS está em `ios/`; gerar um aplicativo instalável para iPhone requer Xcode completo selecionado e uma identidade Apple/provisionamento. Não prometer IPA ou App Store sem essas credenciais.
- React Native + Expo somente se a validação em aparelhos demonstrar necessidade material.
- Identidade nova, clara, corporativa e acessível.
- Monorepo modular com contratos, regras e cliente de API compartilhados.
- Consulta offline dos chamados carregados.
- Criação offline com SQLite, fila persistente, idempotência e envio posterior.
- Comentários e mudanças de status online na primeira versão.
- Implantação progressiva, com backup, rollback e homologação antes das lojas.

## Sistemas, logos e fila operacional

- O chamado exige um Sistema: AceData, Computador, Fluig, Internet, Protheus, WebMail ou Windows 11.
- O backend valida a lista e o banco aplica a constraint; registros anteriores usam `Não classificado` e não entram nas métricas dos logos.
- Administradores veem os logos na ordem aprovada e a contagem de chamados `resolvido` pelo `closed_at` do mês calendário atual em `America/Sao_Paulo`.
- Clicar em um logo filtra a fila por sistema, chamados resolvidos e mês atual. A fila também possui busca por número, título ou solicitante e filtros por sistema, departamento e período, todos processados na API.
- A migration é `backend/scripts/004-ticket-systems.sql`. Aplicá-la somente após backup validado e nunca diretamente em produção sem homologação aprovada.
- Staging validado: `https://chamados-staging.arbtechinfo.com.br`. A produção permanece separada e só deve receber esse release após aprovação explícita do usuário.

## Verificar antes de concluir

- Executar build do frontend e backend após alterações relevantes.
- Validar API, banco e login com evidência fresca.
- Para a entrega de Sistemas, validar também `GET /api/v1/tickets/metrics/systems` como administrador, criação com Sistema obrigatório, filtros e a abertura dos sete assets em `public/systems/`.
- Testar desktop e viewport móvel quando houver mudança de interface.
- Reportar separadamente avisos de build e vulnerabilidades de dependências; não executar correções destrutivas automaticamente.
- Para atualizações de instaladores, manter Android (`artifacts/android/`) e Windows (`artifacts/windows/`) com versão e checksum; registrar iOS como estrutura/simulador até existir assinatura Apple válida.
- Deixar o preview ativo quando o usuário pedir para analisar visualmente.
