---
name: chamados-ti-operational-baseline
description: Linha de base operacional do Chamados-TI. Use ao corrigir criação, edição, exclusão, status, anexos, dashboard, cache/PWA, autenticação, API ou banco; ao preparar backup, staging, publicação ou validação deste aplicativo.
---

# Linha de base operacional do Chamados-TI

## Escopo e fonte de verdade

1. Trabalhar em `/Users/arbtechinfo/Projetos CC/Chamados-TI`.
2. Tratar os arquivos atuais e `PROJETO_MELHORIAS.md` como fonte de verdade; este documento registra uma base técnica, não substitui a inspeção do código e banco atuais.
3. Preservar alterações existentes. A pasta do aplicativo não é um repositório Git independente; não usar o status do repositório pai como confirmação de alterações do app.
4. Nunca registrar, imprimir, copiar ou versionar senhas, tokens, segredos JWT, SMTP ou arquivos `.env`.

## Arquitetura atual

- Frontend: React + Vite, servido localmente em `http://127.0.0.1:5173`.
- Backend: Express + TypeScript, servido localmente em `http://127.0.0.1:3002/api/v1`.
- Banco: PostgreSQL; o cliente nunca se conecta diretamente ao banco.
- Desenvolvimento: o proxy do Vite recebe `/backend/*` e encaminha para `/api/*` no backend.
- Distribuição: PWA, Tauri para macOS/Windows e Capacitor para Android/iOS continuam sendo a estratégia aprovada.

Ler [references/operational-baseline-2026-07-13.md](references/operational-baseline-2026-07-13.md) antes de alterar fluxo crítico ou publicar.

## Diagnosticar fluxos de chamados

1. Ao receber “não cria chamado”, validar primeiro a criação autenticada no endpoint e a persistência no PostgreSQL.
2. Comparar a resposta direta da API com a resposta que passa pelo proxy `/backend`; não presumir falha do banco pela tela.
3. Para criação e edição, conferir validação de título, descrição, categoria, prioridade, departamento, anexo, permissões e mensagens de erro reais.
4. Para exclusão por data ou quantidade, conferir os critérios antes de apagar: data de corte, quantidade a preservar, autorização e total elegível.
5. Testar isolamento por usuário: um usuário comum deve receber apenas os próprios chamados; administrador recebe a visão autorizada.
6. Quando usar dados temporários para teste, removê-los ao final e nunca expor a senha de teste.

## Cache e PWA

- Nunca armazenar no Service Worker respostas autenticadas de `/api` nem de `/backend`.
- A versão de cache em `public/sw.js` deve mudar quando uma regra incorreta de cache precisar ser eliminada em clientes já instalados.
- Após corrigir o Service Worker, validar em uma sessão limpa e orientar atualização/reabertura do aplicativo. Não declarar que produção mudou sem uma publicação explícita.

## Segurança e API

1. Manter rotas em `/api/v1` com autenticação, limitação de abuso, validação no servidor e autorização por recurso.
2. Para anexos, aceitar apenas tipos e tamanhos autorizados; conservar imagens e vídeos de chamados separados de avatar.
3. Retornar erros úteis ao usuário sem revelar stack trace, SQL, caminhos internos ou segredos.
4. Antes de publicar, revisar CORS, cabeçalhos, upload, sessão, autorização de tickets, backup e rollback.

## Validação mínima

Após mudança relevante, executar na raiz:

```sh
npm run verify
npm run test:e2e
```

Confirmar também frontend, API de prontidão, login e o fluxo alterado. O projeto não possui um script de Lighthouse configurado; registrar essa limitação até que a rotina seja adicionada.

## Backup e histórico

1. Executar `sh .agents/skills/chamados-ti-creation-history/scripts/create-project-backup.sh` somente após os testes aplicáveis.
2. Conferir o `.tar.gz`, `.sha256` e `.contents.txt` em `backups/project/`.
3. O backup exclui segredos, dependências, caches e saídas reproduzíveis; não alterar essas exclusões sem uma justificativa técnica.
4. Atualizar a skill histórica existente e esta referência somente com evidência: data, arquivos, comandos, resultado e pendências.
