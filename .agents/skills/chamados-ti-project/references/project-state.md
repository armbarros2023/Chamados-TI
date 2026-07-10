# Estado do projeto Chamados-TI

## Estrutura confirmada

- Frontend: React 19, TypeScript, Vite e React Router.
- Backend: Node.js, Express 5 e TypeScript.
- Banco: PostgreSQL.
- Funções atuais: JWT, chamados, comentários, anexos, e-mail, avatar e usuários.
- Documentos aprovados: `PROJETO_MELHORIAS.md` e `implantacao-multiplataforma.md`.

## Ambiente local preparado em 2026-07-01

- Frontend: `http://127.0.0.1:5173/`.
- API: `http://127.0.0.1:3002/api`.
- Serviço: Homebrew `postgresql@16`.
- Banco local: `chamados_ti_demo`.
- Configuração local: `backend/.env`, ignorada pelo Git.
- Administrador de demonstração: usuário `admin`; senha não armazenada nesta skill.
- Dependências do frontend e backend foram instaladas.
- Schema `backend/scripts/001-create-tickets-table.sql` foi aplicado.
- A autenticação local foi confirmada com HTTP 200.
- Tema claro/escuro e fundação PWA foram implementados em 2026-07-06.
- A build do frontend e do backend, 5 testes frontend, 28 testes backend, 2 testes de scripts e 2 E2E passaram.
- O npm audit reportou zero vulnerabilidades após a fundação PWA.
- Lighthouse local registrou desempenho 99 e acessibilidade 100.
- A API principal usa `/api/v1`; `/api` é compatibilidade temporária com depreciação.
- Backup local com checksum foi validado em 2026-07-07.
- Staging HTTPS publicado em `https://chamados-staging.arbtechinfo.com.br`; o endereço técnico temporário permanece documentado apenas no inventário privado.
- DNS, certificado Let's Encrypt, redirecionamento HTTPS, API v1, readiness, PWA, cabeçalhos de segurança e CORS foram validados externamente em 2026-07-07.
- Restore, migrations, login, PWA e backup remoto foram validados; a senha não é armazenada nesta skill.
- Instalador macOS Tauri 0.1.0 para Apple Silicon gerado em `artifacts/macos/Chamados-TI-0.1.0-arm64.dmg` com assinatura ad-hoc, Keychain e API de staging.
- Release da API `20260707-1623-desktop-auth` suporta sessão nativa rotativa sem alterar o fluxo web por cookie.
- APK Android 0.1.0 de teste gerado em `artifacts/android/Chamados-TI-0.1.0-debug.apk`; API 24–36, HTTPS obrigatório, Android Keystore e assinatura Debug v2 validada.
- Instalador Windows x64 NSIS 0.1.0 gerado em `artifacts/windows/Chamados-TI-0.1.0-x64-setup.exe`; Credential Manager via keyring, PE x86-64 e checksum validados. A assinatura Authenticode e o teste em Windows real permanecem pendentes.
- Gate após Android/Windows: 17 testes frontend, 36 backend, 2 operacionais, lint, builds web/backend, teste Java Android e auditoria mobile aprovados.
- Backup completo seguro mantido em `backups/project/` com permissões `0600`, inventário e SHA-256 ao lado do arquivo; `.env`, dependências e caches reproduzíveis são excluídos deliberadamente.

## Diagnóstico relevante

- A interface agora oferece tema claro padrão e escuro opcional; a modernização estrutural completa continua pendente.
- O dashboard concentra estado e navegação.
- Há uso de `alert`, `confirm` e `prompt`.
- A auditoria encontrou alvos de toque pequenos e lacunas de acessibilidade.
- Há lint, Vitest, Playwright e build de verificação; CI continua pendente.
- Nenhuma skill local existia antes da criação de `chamados-ti-project`.

## Segurança operacional

- Nunca copiar `backend/.env` para documentação, commits ou respostas.
- Não registrar a senha do administrador local em arquivos persistentes.
- Não tratar o ambiente local como produção.
- Confirmar ambiente e destino antes de executar migrations, seeds ou exclusões.
- Nunca persistir access token no cliente; refresh token desktop pertence ao Keychain do sistema operacional.
