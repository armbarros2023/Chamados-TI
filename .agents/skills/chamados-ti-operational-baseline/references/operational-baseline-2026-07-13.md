# Linha de base operacional — 13 de julho de 2026

## Estado registrado

O Chamados-TI usa React/Vite no cliente, Express/TypeScript na API e PostgreSQL para persistência. O frontend local atende na porta 5173 e acessa o backend local pela porta 3002 usando o prefixo `/backend`, que o Vite reescreve para `/api`.

O aplicativo possui autenticação, cadastro público de usuário sem privilégio administrativo, abertura de chamados, departamentos, anexos, status, dashboard e limpeza administrativa. O banco mantém o vínculo do chamado com o usuário solicitante, departamento e data de fechamento para métricas.

## Correção de criação de chamados

Em 13 de julho de 2026 foi investigado o relato de que a tela não criava chamados. A criação foi confirmada no PostgreSQL e a API autenticada devolveu o chamado recém-criado. A resposta pelo proxy do Vite também estava correta.

A causa visual foi o Service Worker: ele deixava de excluir apenas `/api`, mas no desenvolvimento a API é requisitada como `/backend`. Assim, uma resposta autenticada poderia ficar no cache compartilhado do navegador e reaparecer para outra sessão. A correção em `public/sw.js`:

- ignora tanto `/api` quanto `/backend` para requisições cacheáveis;
- eleva o nome do cache de `chamados-ti-shell-v1` para `chamados-ti-shell-v2`, removendo a coleção anterior durante a ativação;
- mantém o cache somente para shell e recursos públicos do aplicativo.

Não publicar esse ajuste sem pedido explícito. Depois de publicado, orientar todos os clientes a atualizar ou reabrir o aplicativo para que o novo Service Worker assuma o controle.

## Evidências de validação

Após a correção foram executados:

```text
npm run verify   -> sucesso: lint, 17 testes frontend, build frontend,
                    38 testes backend, 2 testes de scripts e build backend.
npm run test:e2e -> sucesso: 2 cenários Playwright (desktop e mobile).
```

O dado de teste usado para validar criação pela interface foi removido ao final: chamado e usuário temporários. Nenhuma credencial foi registrada neste histórico.

## Distribuição 0.1.1

Em 13 de julho de 2026 foram atualizados os pacotes de teste para macOS, Android e Windows.

- A marca em `public/brand/arbtech-helpdesk-logo-transparent.png` foi preservada como fonte.
- Foram gerados derivados para PWA, Tauri e Capacitor usando fundo azul-petróleo `#0f766e` e a marca amarela da Arbtech Info.
- A versão foi alinhada como `0.1.1`: `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` e Android (`versionCode` 2).
- O script macOS passou a localizar explicitamente o toolchain Rust local.
- O script Windows passou a gerar o bundle desktop antes do empacotamento, evitando depender de um `dist` deixado por outro alvo.
- Os artefatos ficam em `artifacts/macos/Chamados-TI-0.1.1-arm64.dmg`, `artifacts/android/Chamados-TI-0.1.1-debug.apk` e `artifacts/windows/Chamados-TI-0.1.1-x64-setup.exe`.

Todos apontam para o staging configurado nos modos desktop e Android. O health check de staging respondeu `200`, mas o endpoint de cadastro público `POST /api/v1/auth/register` retornou `404`: a API instalada ainda é anterior ao backend atual. Portanto, não há credencial de teste válida no staging até que a API seja atualizada ou um administrador crie a conta por canal autorizado. Não registrar senhas nesta referência.

## Procedimento de manutenção

1. Confirmar o diretório e o processo backend ativo antes de interpretar um erro; uma instância antiga pode servir código desatualizado.
2. Para falha de criação, atualizar, excluir ou listar tickets, reproduzir com um usuário permitido e comparar banco, API direta e proxy do frontend.
3. Corrigir a causa, não apenas a mensagem genérica.
4. Rodar os gates de validação e só então gerar backup.
5. Para staging ou produção, manter a sequência backup → deploy → health check → login → fluxo de ticket → rollback se houver falha.

## Arquivos relacionados

- `public/sw.js`: regras de cache da PWA.
- `vite.config.ts`: proxy local `/backend` → `/api`.
- `services/apiService.ts`: cliente da API no frontend.
- `backend/src/controllers/ticket.controller.ts`: operações de ticket.
- `backend/src/routes/ticket.routes.ts`: contrato protegido de tickets.
- `.agents/skills/chamados-ti-creation-history/`: histórico e backup seguro existentes.
