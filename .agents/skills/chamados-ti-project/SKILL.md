---
name: chamados-ti-project
description: Contexto operacional e decisões do projeto Chamados-TI. Use sempre que o usuário mencionar Chamados-TI, Chamados_TI, Suporte Chemisch, o preview local nas portas 5173/3002, a modernização web/PWA, Tauri, Capacitor ou a continuidade do plano de melhorias deste helpdesk.
---

# Chamados TI Project

## Começar pelo contexto correto

1. Trabalhar em `/Users/arbtechinfo/Projetos CC/Chamados-TI`.
2. Confirmar o caminho antes de editar; a pasta não é um repositório Git independente e o status do repositório pai é ruidoso.
3. Ler `PROJETO_MELHORIAS.md` antes de qualquer mudança estrutural ou visual.
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
- React Native + Expo somente se a validação em aparelhos demonstrar necessidade material.
- Identidade nova, clara, corporativa e acessível.
- Monorepo modular com contratos, regras e cliente de API compartilhados.
- Consulta offline dos chamados carregados.
- Criação offline com SQLite, fila persistente, idempotência e envio posterior.
- Comentários e mudanças de status online na primeira versão.
- Implantação progressiva, com backup, rollback e homologação antes das lojas.

## Verificar antes de concluir

- Executar build do frontend e backend após alterações relevantes.
- Validar API, banco e login com evidência fresca.
- Testar desktop e viewport móvel quando houver mudança de interface.
- Reportar separadamente avisos de build e vulnerabilidades de dependências; não executar correções destrutivas automaticamente.
- Deixar o preview ativo quando o usuário pedir para analisar visualmente.
