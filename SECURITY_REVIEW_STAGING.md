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

---

## Reavaliação de pré-deploy — 2026-07-13

### Correções aplicadas

- Removida a injeção de `GEMINI_API_KEY` no bundle Vite; nenhuma chave de ambiente é exposta ao cliente por configuração de build.
- Removida a superfície legada `/api`; a aplicação aceita somente `/api/v1`.
- Upload de anexos protegido por limites específicos de criação, anexo e e-mail; vídeo exige assinatura `ftyp`, anexos privados são gravados com permissão `0600` e são removidos quando o chamado é excluído ou limpo.
- Mensagem de limite diferencia avatar (5 MB) de anexo de chamado (100 MB).
- Gestão de usuários valida função e e-mail, exige a mesma política de senha no frontend e backend e impede remover ou rebaixar o último administrador.
- `.gitignore` passou a proteger arquivos de ambiente, artefatos e diretórios de compilação reproduzíveis.
- Instaladores 0.1.1 para macOS, Android e Windows foram recompilados após as correções.

### Evidências

- `npm run verify`: 17 testes de frontend, 42 de backend, 2 de scripts, lint e builds aprovados.
- `npm run test:e2e`: 2 cenários Playwright aprovados em desktop e mobile.
- `npm audit --omit=dev --audit-level=high` no frontend e backend: 0 vulnerabilidades.

### Bloqueios de produção restantes

1. Publicar a API atual no staging e executar smoke test autenticado; o staging acessível ainda responde `404` para o cadastro público atual.
2. Produzir instaladores de release assinados: Apple Developer + notarização para macOS, certificado Authenticode para Windows e keystore de release para Android. O APK atual é de depuração e os binários de desktop não são assinados para distribuição pública.
3. Configurar retenção e alerta de logs no servidor, proteção de borda/rate limit no proxy e backup automatizado com ensaio de restauração periódico.
4. Avaliar MFA para administradores antes da liberação geral.
5. Para anexos grandes, planejar upload por streaming/diretório temporário; os limites e a taxa mitigam abuso, mas o middleware atual mantém o arquivo em memória durante a validação.
