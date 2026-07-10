# Revisão de segurança — preparação de staging e API v1

Data: 2026-07-07. Escopo: backend local, staging HTTPS autorizado, backup, rotas `/api/v1` e cliente macOS Tauri.

## Fronteiras e ativos

- Clientes web/PWA/instaladores → API HTTPS → PostgreSQL.
- Identidades: usuário e administrador.
- Dados sensíveis: credenciais, tokens, chamados, anexos, e-mail e dados do perfil.
- Operações privilegiadas: gestão de usuários, limpeza/exclusão, mudança de status e restauração de banco.

## OWASP verificado

| Área | Estado | Evidência |
|---|---|---|
| Controle de acesso | Verificado no escopo atual | `ticket-access.test.ts`, middleware `protect/admin/requireTicketAccess`. |
| Configuração | Verificado parcialmente | Helmet, `x-powered-by` desativado, erros genéricos, CORS allowlist e falha fechada sem `CLIENT_URLS` em produção. |
| Supply chain | Verificado | Lockfiles presentes; `npm audit` frontend/backend sem vulnerabilidades em 2026-07-07. |
| Criptografia e sessão | Verificado | bcrypt, JWT com issuer/audience, refresh token armazenado por hash, rotação atômica, cookie seguro e Keychain no cliente macOS. |
| Injection/XSS | Verificado no conjunto atual | Queries parametrizadas e testes de validação/escape; nenhuma concatenação SQL identificada nas rotas revisadas. |
| Abuso e autenticação | Verificado parcialmente | Login limitado por IP e mensagem genérica; MFA e limites globais ainda pendentes. |
| Upload | Verificado | Allowlist, tamanho, nomes gerados e armazenamento fora de exposição direta cobertos por testes. |
| Logs e auditoria | Pendente parcial | Erros internos não vazam detalhes ao cliente; trilha de auditoria administrativa ainda não existe. |
| Exceções/recursos | Verificado parcialmente | Limites de corpo, falha genérica e readiness do banco; monitoramento externo ainda pendente. |
| SSRF | Não aplicável no fluxo revisado | Não foi encontrado endpoint que busque URL fornecida pelo usuário. |

## Achados residuais

### Médio — ações privilegiadas sem trilha de auditoria

- **Local:** gestão de usuários, exclusão/limpeza e mudança de status.
- **Impacto:** alterações administrativas podem não ter autoria e contexto suficientes para investigação.
- **Correção:** tabela append-only de auditoria com ator, ação, recurso, data e resultado, sem tokens ou conteúdo sensível.
- **Teste:** confirmar um evento por ação privilegiada e ausência de segredo no payload.

### Médio — administradores sem MFA

- **Local:** fluxo de autenticação.
- **Impacto:** credencial administrativa comprometida concede acesso amplo.
- **Correção:** TOTP/WebAuthn após estabilizar staging, começando por administradores.
- **Teste:** login administrativo exige segundo fator e recuperação é auditada.

### Médio — proteção contra abuso concentrada no login

- **Local:** `auth.routes.ts` limita login; demais rotas dependem apenas de autenticação/autorização.
- **Impacto:** conta válida ou cliente automatizado pode pressionar upload, e-mail ou criação de chamados.
- **Correção:** limites específicos por usuário/IP para upload, e-mail e mutações.
- **Teste:** excesso retorna 429 sem afetar leitura normal.

### Resolvido — restauração ensaiada em staging

- **Evidência:** backup restaurado no banco isolado `chamados_ti_staging`; migrations, `/ready` e login real aprovados em 2026-07-07.
- **Risco restante:** automatizar ensaios periódicos e registrar tempo de recuperação.

## Risco residual

Não há achado crítico ou alto validado neste lote. HTTPS, domínio corporativo, restore drill e transporte nativo foram concluídos em staging. Produção permanece bloqueada até monitoramento, assinatura/notarização dos instaladores e avaliação dos achados médios.
