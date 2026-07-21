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
- Staging HTTPS publicado em `https://chamados-staging.arbtechinfo.com.br`; o endereço `https://chamados-staging.72-61-63-197.nip.io` permanece como contingência.
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

## Atualização — 2026-07-20: Sistemas e atendimento em staging

- Plano aprovado registrado em `PLANO_SISTEMAS_E_ATENDIMENTO.md`.
- Campo `system` obrigatório para novos chamados, com sete valores controlados: AceData, Computador, Fluig, Internet, Protheus, WebMail e Windows 11.
- Migration `backend/scripts/004-ticket-systems.sql` adiciona o campo, preserva registros anteriores como `Não classificado`, cria constraint e índice `(system, closed_at)`.
- Dashboard administrativo ganhou logos WebP em `public/systems/`, métricas mensais de chamados resolvidos e atalho para filtrar a fila.
- Filtros de API e interface: busca por número/título/solicitante, sistema, departamento, status e período; a paginação continua no servidor.
- Rotas de métricas, status, exclusão e limpeza passaram a declarar proteção administrativa também no roteador, além da validação do controlador.
- Staging recebeu o release `20260720-2318-systems` após backup validado. API, asset WebP, bloqueio sem login, Playwright desktop/mobile e produção isolada foram confirmados.
- Gates aprovados: lint, 19 testes frontend, 44 backend, 2 scripts, builds frontend/backend, Playwright desktop/mobile e Lighthouse de staging (91 desempenho, 100 acessibilidade, 96 boas práticas; SEO interno 66).
- Pendência para a retomada: teste autenticado manual do dashboard e do fluxo de criação em staging; depois, aprovação explícita antes de produção e recompilação dos instaladores.

## Atualização — 2026-07-21: Ocean Pulse, métricas e instaladores 0.1.2

- O dashboard de staging recebeu o tema escuro Ocean Pulse, quatro KPIs, filtro recolhido, resumo da fila e métricas por departamento.
- As métricas por departamento e o resumo da fila aparecem para todos: administradores recebem a visão geral e usuários comuns recebem apenas métricas dos próprios chamados, aplicadas pela API.
- Release ativo em staging: `20260721-1245-dashboard-metrics`; saúde e readiness responderam HTTP 200 e Playwright desktop/mobile aprovou quatro fluxos.
- Android 0.1.2: APK Debug em `artifacts/android/Chamados-TI-0.1.2-debug.apk`, `versionCode` 3, assinatura APK v2 válida e checksum `af13d4d7a3ce6fce623926bd0d9dd113794fd25fba3383481a729fb565e1f2ef`.
- Windows 0.1.2: NSIS x64 em `artifacts/windows/Chamados-TI-0.1.2-x64-setup.exe`, checksum `7710583f49506ab7829d7d2a3801d280b27a86bb94dd82e5a13cc28a00404ab2`; assinatura Authenticode e teste físico em Windows seguem pendentes.
- iOS Capacitor criado em `ios/`, integrado ao Keychain para refresh token e sincronizado com a API HTTPS de staging. A build de simulador e o IPA não puderam ser gerados porque o Mac aponta apenas para Command Line Tools e não possui identidade Apple de assinatura.
- `npm run verify` aprovou 23 testes frontend e 44 backend; `npm audit --omit=dev` não encontrou vulnerabilidades de produção. O audit completo ainda indica uma vulnerabilidade alta de desenvolvimento, sem correção automática aplicada.
