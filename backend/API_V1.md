# Contrato inicial da API v1

Base principal: `/api/v1`. A base `/api` permanece temporariamente e responde com `Deprecation: true` e link para a sucessora.

## Operação

- `GET /health`: processo ativo; não consulta dependências.
- `GET /ready`: processo e PostgreSQL disponíveis.

## Recursos preservados

- `/auth`: login, renovação e logout.
- `/tickets`: listagem, criação, comentários, anexos, status, leitura, e-mail e exclusão.
- `/users`: listagem e administração de usuários.

Todos os recursos, exceto autenticação e health checks, mantêm autenticação e autorização já aplicadas nas rotas atuais. O cliente web passa a usar `/api/v1`; clientes antigos continuam em `/api` durante a janela de migração.

O refresh token é rotacionado atomicamente a cada renovação. A migration `scripts/002-refresh-session-rotation.sql` deve ser aplicada antes de implantar esta versão da API.

## Sessão para aplicativo instalado

O navegador continua usando exclusivamente o cookie `HttpOnly`, `SameSite=Strict` e `Secure` em staging/produção. O cliente Tauri usa um transporte público nativo porque o protocolo interno do WebView não compartilha esse cookie de forma confiável:

- Envia `X-Chamados-Client: desktop` sem cabeçalho `Origin`.
- Recebe `refreshToken` no JSON de login e o guarda no Keychain do sistema operacional.
- Envia `{ "refreshToken": "..." }` no refresh e logout; o token é rotacionado pelo mesmo armazenamento hash do servidor.
- Pedidos com `Origin` nunca são tratados como cliente nativo, mesmo que tentem enviar o cabeçalho desktop.
- Access tokens continuam curtos e não são persistidos pelo aplicativo.

Esse cabeçalho identifica o transporte, não autentica o aplicativo e não contém segredo. Autenticação e autorização continuam baseadas nas credenciais, sessão rotativa e permissões do usuário.
