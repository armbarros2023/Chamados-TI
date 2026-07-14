# Histórico de criação e implantação — Chamados TI

## Estado atual

- Checkout: `/Users/arbtechinfo/Projetos CC/Chamados-TI`.
- Frontend: React 19, TypeScript, Vite, React Router e Tailwind CSS.
- Backend: Node.js, Express 5, TypeScript e PostgreSQL.
- Arquitetura de distribuição aprovada: PWA, Tauri para Windows/macOS e Capacitor para Android/iOS.
- Comunicação aprovada: aplicativos acessam somente a API HTTPS; PostgreSQL não é exposto aos clientes.
- Documentos vigentes: `PROJETO_MELHORIAS.md`, `DESIGN.md` e `implantacao-multiplataforma.md`.

## Cronologia

### 2026-07-01 — Diagnóstico e direção de modernização

- A estrutura React/Vite + Express/PostgreSQL foi confirmada.
- Foi criado `PROJETO_MELHORIAS.md` com direção web/PWA, mobile, acessibilidade, segurança, offline e implantação progressiva.
- A identidade aprovada passou a ser clara, corporativa e acessível.
- O preview local foi recuperado em `http://127.0.0.1:5173/`; a API usa `http://127.0.0.1:3002/api`.
- PostgreSQL 16 e o banco local `chamados_ti_demo` foram usados para validar autenticação HTTP 200.
- Existe administrador local de demonstração; a senha foi deliberadamente excluída do histórico.
- Foi criada a skill operacional `.agents/skills/chamados-ti-project`.

### 2026-07-06 — Tema claro/escuro

- O tema claro permaneceu padrão e o escuro passou a ser opcional.
- A primeira visita respeita `prefers-color-scheme`; a escolha posterior fica em `localStorage` sob `chamados-ti-theme`.
- O seletor foi incluído no login e na navegação autenticada com nomes acessíveis.
- Arquivos principais: `context/ThemeContext.tsx`, `components/ThemeToggle.tsx`, `App.tsx`, `pages/LoginPage.tsx`, `components/Sidebar.tsx`, `index.css` e `tailwind.config.js`.
- Testes adicionados: `tests/theme.test.tsx`; o teste de login foi adaptado ao provider de tema.

### 2026-07-06 — Plano econômico multiplataforma

- Foi criado `implantacao-multiplataforma.md`.
- Ordem aprovada: staging/API segura → PWA → Tauri → Capacitor → offline → homologação/publicação.
- Tauri/Capacitor substituiu React Native/Expo como primeira opção para maximizar o reaproveitamento do frontend. Expo permanece alternativa se aparelhos reais revelarem limitação material.
- Custos externos identificados: ferramentas principais gratuitas; publicação Apple e Google e eventual infraestrutura/assinatura podem gerar custos.

### 2026-07-06 — Fundação PWA concluída

- Manifest criado em `public/manifest.webmanifest`.
- Service worker criado em `public/sw.js`, com exclusão explícita de requisições `/api` do cache.
- Tela offline criada em `public/offline.html`.
- Registro do service worker criado em `pwa/registerServiceWorker.ts` e chamado por `index.tsx`.
- Metadados PWA adicionados ao `index.html`.
- Ícones derivados criados em `public/icons/`; `public/images.png` permaneceu preservado.
- `.env.example` passou a documentar a API local completa; `.env.production.example` usa domínio HTTPS ilustrativo, sem segredo.
- Testes PWA adicionados em `tests/pwa.test.tsx` seguindo RED/GREEN.

### 2026-07-07 — Staging local, backup e API v1

- Criados `.env.staging.example`, `backend/.env.staging.example` e `STAGING.md` sem segredos reais.
- Criados scripts de backup, checksum, verificação, migration e restore protegido em `backend/scripts/`.
- Backup local de 15 KB criado após correção testada da conversão segura de `DATABASE_URL`; checksum e catálogo do PostgreSQL foram validados.
- API refatorada para `backend/src/app.ts`, com bootstrap separado em `backend/src/index.ts`.
- `/api/v1` tornou-se base principal; `/api` permanece compatível com aviso de depreciação.
- Health e readiness foram confirmados com HTTP 200; origem fora do CORS recebeu HTTP 403.
- Cookie de refresh passou a cobrir `/api`; refresh token passou a ser rotacionado atomicamente para impedir replay.
- Migration `002-refresh-session-rotation.sql` foi aplicada ao banco local depois do backup.
- Revisão OWASP e riscos residuais foram registrados em `SECURITY_REVIEW_STAGING.md`.
- Staging externo e restore drill permanecem pendentes por falta de domínio/servidor de destino aprovado.

### 2026-07-07 — Publicação do staging HTTPS

- VPS de staging autorizada; credencial de acesso não foi persistida.
- URL temporária de contingência registrada somente na documentação operacional privada.
- Release `20260707-0954` publicado sem alterar os demais vhosts.
- Nginx serve a PWA e encaminha `/api/` ao systemd `chamados-ti-staging` em `127.0.0.1:3102`.
- Banco isolado `chamados_ti_staging` recebeu restore e migrations.
- Let's Encrypt, HTTPS obrigatório, HSTS, CSP, COOP/CORP e MIME do manifest foram validados.
- Login real, painel e service worker foram confirmados por Playwright. A senha não foi registrada.
- Backup remoto pós-deploy foi criado em `/var/backups/chamados-ti-staging/` e validado.
- Lighthouse público: 92 desempenho, 100 acessibilidade, 100 boas práticas e 63 SEO.
- A porta 3102 não está exposta; somente Nginx responde em 80/443.

### 2026-07-07 — Domínio corporativo do staging

- O registro `A` de `chamados-staging.arbtechinfo.com.br` foi confirmado nos servidores DNS autoritativos.
- O Nginx passou a atender o domínio corporativo e preservou o endereço `nip.io` como contingência.
- O certificado Let's Encrypt foi expandido para os dois domínios, com renovação automática e validade atual até 2026-10-05.
- O CORS passou a aceitar as duas origens de staging; uma origem externa continuou bloqueada com HTTP 403.
- Frontend, redirecionamento HTTP para HTTPS, `/api/v1/health`, `/api/v1/ready`, manifest PWA, HSTS, CSP, COOP/CORP e demais cabeçalhos foram validados externamente.
- Backups restritos da configuração anterior do Nginx e do ambiente foram mantidos no servidor para rollback; nenhuma credencial foi registrada neste histórico.

### 2026-07-07 — Aplicativo macOS Tauri 0.1.0

- Desenho aprovado registrado em `TAURI_DESIGN.md`; ordem de entrega: macOS, Android e Windows.
- Tauri 2 e Rust foram configurados com frontend local, CSP, capabilities mínimas e acesso HTTP restrito à API corporativa.
- Access token fica apenas em memória; refresh token rotativo é guardado no Keychain por comandos Rust com validação de formato.
- A API ganhou transporte desktop sem `Origin`, mantendo o cookie `HttpOnly`, `SameSite=Strict` e seguro para o navegador.
- Ciclos RED/GREEN cobriram identificação do cliente nativo, login, rotação, logout, Keychain, seleção de transporte, service worker e URL de avatar.
- Gate completo: 13 testes frontend, 36 backend, 2 operacionais, 1 Rust, lint e builds aprovados.
- Release `20260707-1623-desktop-auth` publicado no staging; health/readiness e contrato nativo responderam HTTP 200, CORS externo respondeu 403.
- Instalador Apple Silicon salvo em `artifacts/macos/Chamados-TI-0.1.0-arm64.dmg`, SHA-256 `50ec6fe5211996280295bd61c6c44a7753fc3630c6fb1a52da9e042bac7844a3`.
- DMG e assinatura ad-hoc foram validados; nenhuma credencial foi encontrada. A inspeção visual automatizada ficou pendente por permissão do macOS e o login deve ser confirmado manualmente.

### 2026-07-07 — Aplicativo Android Capacitor 0.1.0

- Capacitor 8 e Android SDK 36 foram configurados; o projeto nativo usa `com.arbtechinfo.chamadosti`, API mínima 24 e alvo 36.
- O cliente instalado reutiliza o contrato HTTPS nativo da API e mantém o access token somente em memória.
- Foi criado o plugin `SecureSession`: refresh token validado e cifrado com AES-GCM usando chave não exportável do Android Keystore.
- O manifesto desativa backup do aplicativo e tráfego HTTP em texto claro; o service worker não é registrado no runtime Android.
- Ciclos RED/GREEN cobriram detecção do Android, transporte nativo, cofre de sessão e bloqueio do service worker.
- Gradle executou 102 tarefas com sucesso, incluindo teste Java do formato do token.
- APK Debug v2 válido salvo em `artifacts/android/Chamados-TI-0.1.0-debug.apk`, SHA-256 `d07e0cc219f44963c2048e3b6296ef97051b753d585d443d4f633a2d36b047a5`.
- O pacote usa somente a permissão de internet esperada e não apresentou credenciais na inspeção. Não havia aparelho ADB conectado; teste físico permanece pendente.

### 2026-07-07 — Aplicativo Windows Tauri 0.1.0

- Rust `x86_64-pc-windows-msvc`, cargo-xwin 0.23.0, LLVM 22 e NSIS 3.12 foram preparados no Mac.
- O executável Tauri e o instalador NSIS x64 foram compilados com sucesso usando saída temporária isolada.
- O PE x86-64 foi validado com ASLR, high-entropy VA e DEP/NX; variáveis de segredo não foram encontradas.
- Instalador salvo em `artifacts/windows/Chamados-TI-0.1.0-x64-setup.exe`, SHA-256 `a0068db2111e94dedcdf9fc6275da4687137a4f48f971d92497ef9b5103dd299`.
- O refresh token usa o Windows Credential Manager por `keyring`; o acesso à API permanece restrito ao domínio HTTPS de staging.
- A compilação cruzada é experimental e não permite assinatura padrão no host macOS; instalação em Windows real e Authenticode permanecem pendentes.
- Gate geral após as duas plataformas: 17 testes frontend, 36 backend, 2 operacionais, lint e builds aprovados; auditoria mobile verificou 77 arquivos sem achados.

### 2026-07-07 — Backup final e skill histórica atualizada

- Backup completo seguro salvo em `backups/project/`, tamanho aproximado de 13 MB e permissões `0600`.
- O nome datado e o SHA-256 validado permanecem nos arquivos `.sha256` ao lado de cada backup, evitando autorreferência dentro do próprio arquivo.
- Inventário salvo ao lado do arquivo; código, documentação, skills e os três instaladores de teste estão presentes.
- `.env`, dependências, caches e builds intermediárias foram excluídos para evitar segredos, duplicação e 3 GB de conteúdo reproduzível.
- A skill `chamados-ti-creation-history` ganhou o script determinístico `scripts/create-project-backup.sh` e metadados atualizados.
- `quick_validate.py` confirmou `Skill is valid!`; o script foi executado e seu checksum portátil foi testado.

## Evidência validada em 2026-07-06

- Frontend: 5 testes aprovados.
- Backend: 28 testes aprovados.
- Scripts operacionais: 2 testes aprovados.
- `npm run lint`: aprovado.
- Builds frontend e backend: aprovadas.
- Playwright: 2 fluxos aprovados, desktop e mobile.
- `npm audit`: zero vulnerabilidades após remover Lighthouse como dependência local.
- Lighthouse na build servida: desempenho 99, acessibilidade 100, boas práticas 96 e SEO 63.
- O service worker foi confirmado ativo no Chromium, com escopo `/` e manifest `/manifest.webmanifest`.
- Manifest JSON e sintaxe do service worker foram validados.

## Limitações conhecidas

- A API e o PostgreSQL estão implantados em staging; produção continua não iniciada.
- O campo de produção em `.env.production.example` é apenas exemplo e precisa receber o domínio real antes do deploy.
- O modo offline atual oferece shell e aviso de indisponibilidade; cache de chamados, rascunhos e fila SQLite ainda não foram implementados.
- Instaladores de teste macOS Apple Silicon, Android e Windows x64 foram gerados; testes físicos Android/Windows, macOS Intel, assinaturas de distribuição, notarização e lojas continuam pendentes.
- O Lighthouse registrou falha de rede porque a API local estava desligada durante a medição; SEO baixo é esperado porque `robots.txt` bloqueia indexação de um sistema interno.
- O build Vite emite avisos de diretivas `use client` vindas do React Router; o build termina com sucesso.
- O projeto não é um repositório Git independente; o status do repositório pai contém muitos arquivos não relacionados.
- O backup local está em `backups/`, ignorado pelo Git, e não substitui cópia externa criptografada futura.
- O staging já usa domínio corporativo; o endereço `nip.io` permanece apenas como contingência temporária.

## Próxima sequência

1. Criar staging, backup e restauração testada.
2. Versionar e fortalecer a API em `/api/v1`.
3. Configurar domínio HTTPS real e validar PWA conectada.
4. Empacotar desktop com Tauri.
5. Empacotar Android/iOS com Capacitor.
6. Implementar fila offline idempotente e homologação progressiva.

## Regra de atualização

Acrescentar novos marcos apenas depois de validação proporcional ao risco. Registrar também falhas, verificações não concluídas e decisões substituídas. Nunca adicionar conteúdo de `.env` nem credenciais.
