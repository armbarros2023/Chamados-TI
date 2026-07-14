# Implantação multiplataforma — Chamados TI

## Objetivo

Entregar o Chamados TI como PWA, aplicativo de desktop para Windows/macOS e aplicativo móvel para Android/iOS, mantendo uma única interface React e uma API HTTPS central. O banco PostgreSQL nunca será acessado diretamente pelos aplicativos instalados.

## Arquitetura aprovada

```text
PWA / Tauri / Capacitor
          |
       HTTPS/TLS
          |
    API Express /api/v1
          |
      PostgreSQL
```

- **Web e PWA:** React + Vite, manifest, service worker e atualização controlada.
- **Windows e macOS:** Tauri 2 usando a build web existente.
- **Android e iOS:** Capacitor 8 usando a mesma build React.
- **Servidor:** API Express modular, PostgreSQL, armazenamento privado de anexos e serviço de e-mail/notificações.
- **Configuração:** URL pública da API incorporada por ambiente; nenhum segredo, senha ou acesso ao banco dentro do instalador.

## Sequência de implantação

- [ ] **1. Congelar contratos atuais e preparar homologação:** inventariar rotas, permissões, tabelas, anexos e e-mails; criar ambiente de staging e backup restaurável. → **Verificar:** login, abertura, resposta e consulta funcionam no staging com cópia sanitizada dos dados.
- [ ] **2. Fortalecer a API `/api/v1`:** padronizar schemas e erros, negar acesso por padrão, aplicar autorização por recurso, rate limit, CORS restrito, trilha de auditoria e refresh token rotativo. → **Verificar:** testes de autenticação, enumeração, autorização horizontal/vertical, upload e revogação passam.
- [x] **3. Preparar a PWA:** adicionar manifest, ícones, service worker, cache somente de assets e tela offline clara; manter operações sensíveis dependentes da API. → **Verificado em 2026-07-06:** manifest e service worker ativos no Chromium; E2E desktop/mobile aprovados; Lighthouse 99 em desempenho e 100 em acessibilidade.
- [x] **4. Implementar sessão e configuração multiplataforma:** criar cliente único da API, selecionar endpoint por ambiente e armazenar tokens em Keychain/Keystore no app; web usa cookie seguro `HttpOnly` quando a API estiver no mesmo domínio. → **Verificado em 2026-07-07:** web preserva cookie seguro; Tauri usa Keychain/Credential Manager; Android usa AES-GCM no Android Keystore; access token permanece em memória e inspeções não encontraram credenciais.
- [ ] **5. Empacotar desktop com Tauri:** gerar Windows `.msi/.exe` e macOS `.dmg`, limitar permissões do shell, assinar artefatos e configurar atualização assinada. → **Verificar:** instalar, atualizar, desinstalar e abrir chamado em Windows e macOS limpos.
- [ ] **6. Empacotar mobile com Capacitor:** criar projetos Android/iOS, permitir apenas o domínio HTTPS da API, integrar câmera/anexos, push e armazenamento seguro. → **Verificar:** gerar `.aab` e build iOS assinada; testar login, chamado, resposta e sessão expirada em aparelhos reais.
- [ ] **7. Adicionar operação offline controlada:** persistir chamados já carregados e rascunhos; usar fila SQLite com chave de idempotência para novos chamados; comentários e mudança de status continuam online na V1. → **Verificar:** criar offline, reconectar e confirmar exatamente um chamado no servidor.
- [ ] **8. Automatizar builds e releases:** pipeline separado para web/API, Tauri e Capacitor; SBOM, auditoria de dependências, assinatura, checksums e promoção de staging para produção. → **Verificar:** release reproduzível a partir de tag e rollback para a versão anterior.
- [ ] **9. Homologar e liberar progressivamente:** piloto interno, métricas de erro/latência/sincronização, canary da API e distribuição restrita dos instaladores antes das lojas. → **Verificar:** critérios abaixo atendidos durante a janela de observação.
- [ ] **10. Verificação final:** executar lint, unitários, integração, E2E, segurança, acessibilidade, Lighthouse, backup/restore e ensaio de rollback. → **Verificar:** relatório de release aprovado sem falhas críticas ou altas.

## Segurança mínima para produção

- Senhas com `bcrypt`, política forte, bloqueio progressivo e opção de MFA para administradores.
- Access token curto; refresh token rotativo, revogável e protegido pelo sistema operacional.
- TLS válido, HSTS, headers de segurança, CORS por allowlist e nenhum endpoint PostgreSQL exposto.
- Validação de entrada no servidor, queries parametrizadas, autorização por chamado e perfil.
- Upload com allowlist de tipos, limite de tamanho, nome gerado, armazenamento não público e futura varredura antimalware.
- Logs sem senha/token/conteúdo sensível; alertas para login anômalo, abuso e ações administrativas.
- Atualizações Tauri, Android e iOS somente com artefatos assinados.

## Critérios de aceite

- O usuário instala e abre pelo ícone sem informar URL.
- A mesma conta acessa PWA, Windows, macOS, Android e iOS conforme sua permissão.
- Chamados e respostas são sincronizados exclusivamente pela API HTTPS.
- Perda de conexão não duplica chamado e informa claramente o estado local.
- Nenhum segredo ou credencial do banco existe nos aplicativos distribuídos.
- Fluxos críticos atendem WCAG 2.2 AA e funcionam em teclado, toque e leitores de tela.
- Backup, migração e rollback são testados antes do lançamento.

## Decisões arquiteturais

| Decisão | Alternativas | Motivo e custo aceito |
|---|---|---|
| API central em vez de banco direto | PostgreSQL embarcado ou conexão direta | Protege credenciais e centraliza autorização; exige servidor disponível e monitorado. |
| Tauri no desktop | Electron ou apenas PWA | Instaladores menores e reaproveitamento do React; requer toolchain Rust e assinatura por plataforma. |
| Capacitor no mobile | React Native/Expo ou Tauri mobile | Maior reaproveitamento imediato da interface Vite; aceita-se adaptar componentes que precisem de comportamento realmente nativo. |
| Monólito modular | Microserviços | Escala e equipe atuais não justificam complexidade distribuída; serviços podem ser extraídos quando houver evidência. |
| REST síncrono com push pontual | Arquitetura totalmente orientada a eventos | Menor complexidade operacional; notificações usam canal dedicado sem transformar todo o domínio em eventos. |

## Gatilhos para rever decisões

- Migrar partes para React Native somente se testes mostrarem UX ou desempenho insuficientes no Capacitor.
- Extrair serviços somente quando houver equipes independentes ou necessidades reais de escala isolada.
- Introduzir fila no servidor quando e-mail, push ou anexos afetarem a latência ou a confiabilidade das requisições.

## Ordem de entrega

1. Staging, backup e API segura.
2. PWA instalável.
3. Desktop Tauri.
4. Mobile Capacitor.
5. Offline, automação de releases e piloto.
6. Publicação controlada nas lojas e distribuição corporativa.

## Progresso da implantação

### 2026-07-06 — Fundação PWA concluída

- Manifest instalável com nome, cores e ícones de 192/512 px.
- Service worker com cache do shell e exclusão explícita de `/api`.
- Tela offline acessível, sem prometer envio quando a API estiver indisponível.
- Endpoint da API documentado separadamente para desenvolvimento e produção.
- Registro do service worker coberto por testes automatizados.
- Build, lint, testes frontend/backend e E2E desktop/mobile aprovados.
- Lighthouse local: desempenho 99, acessibilidade 100, boas práticas 96 e SEO 63. Os dois últimos refletem API local desligada durante a medição e bloqueio intencional de indexação para um sistema interno.

### 2026-07-07 — Fundação de staging, backup e API v1 concluída localmente

- Exemplos separados de ambiente para staging e runbook em `STAGING.md`.
- Backup PostgreSQL em formato custom, checksum SHA-256 e verificação de catálogo implementados.
- Backup local de 15 KB criado com permissões `0600` e validado; conteúdo permanece em `backups/`, fora do Git.
- Restore de staging exige `NODE_ENV=staging` e `CONFIRM_RESTORE=staging`; não foi executado sem banco de destino aprovado.
- API principal montada em `/api/v1`; `/api` permanece temporariamente com cabeçalhos de depreciação.
- `/api/v1/health` e `/api/v1/ready` responderam HTTP 200 com o PostgreSQL local.
- CORS usa allowlist de origens e bloqueou origem não autorizada com HTTP 403.
- Refresh token passou a girar atomicamente; migration aditiva aplicada ao banco local após backup.
- Gate atualizado: 5 testes frontend, 28 backend, 2 testes de scripts, builds aprovadas e zero vulnerabilidades npm.
- Revisão OWASP registrada em `SECURITY_REVIEW_STAGING.md`.
- As etapas 1 e 2 continuam abertas até existir staging real, restore drill, trilha de auditoria e proteção específica contra abuso nas mutações.

### 2026-07-07 — Staging HTTPS publicado no VPS

- Publicado em `https://chamados-staging.72-61-63-197.nip.io` sem alterar os sites existentes no VPS.
- Release `20260707-0954`, usuário Linux sem login, banco PostgreSQL e serviço systemd isolados.
- Node escuta apenas em `127.0.0.1:3102`; a porta não responde externamente.
- Backup restaurado, migrations aplicadas e `/api/v1/ready` confirmado.
- Let's Encrypt instalado com HTTP→HTTPS e renovação automática.
- Nginx endurecido com HSTS, CSP, proteção contra framing e MIME correto do manifest.
- Login administrativo real, painel, manifest e service worker validados. A senha não foi registrada no projeto.
- Backup remoto pós-deploy de 15,8 KB validado por checksum e catálogo PostgreSQL.
- Lighthouse público: desempenho 92, acessibilidade 100, boas práticas 100 e SEO 63; indexação segue bloqueada intencionalmente.
- A etapa 1 permanece aberta para validar abertura/resposta de chamado e adotar domínio corporativo.
- A etapa 2 permanece aberta para trilha de auditoria, MFA e limites específicos de abuso.

### 2026-07-07 — Instalador macOS Tauri 0.1.0 gerado

- Frontend React/Vite incorporado localmente ao Tauri 2 e configurado para a API corporativa de staging.
- Sessão desktop usa access token em memória e refresh rotativo no Keychain; o navegador preserva o cookie `HttpOnly`.
- Capabilities permitem HTTP apenas para `chamados-staging.arbtechinfo.com.br`; shell e acesso genérico a arquivos não foram habilitados.
- Release da API `20260707-1623-desktop-auth` publicado com rollback para `20260707-0954` preservado.
- DMG Apple Silicon com assinatura ad-hoc completa salvo em `artifacts/macos/Chamados-TI-0.1.0-arm64.dmg`.
- Integridade do DMG, assinatura do app, ausência de credenciais, montagem e inicialização do processo foram validadas.
- A etapa desktop continua aberta para teste manual de login/chamados, build Intel, Windows, Developer ID e notarização.

### 2026-07-07 — APK Android Capacitor 0.1.0 gerado

- Projeto Capacitor 8 criado com identificador `com.arbtechinfo.chamadosti`, `minSdk` 24 e `targetSdk` 36.
- Acesso à API usa HTTPS nativo e o domínio corporativo de staging; tráfego HTTP em texto claro está bloqueado.
- Refresh token fica criptografado com AES-GCM e chave não exportável do Android Keystore; backup do aplicativo está desativado.
- Service worker foi desativado dentro do runtime Android e o contrato nativo de login/refresh/logout recebeu testes RED/GREEN.
- APK Debug salvo em `artifacts/android/Chamados-TI-0.1.0-debug.apk`; assinatura v2, metadados, checksum e ausência de credenciais foram validados.
- Build Gradle e teste Java aprovados; não havia aparelho conectado ao ADB, portanto login e chamados ainda precisam de homologação física.
- A etapa mobile continua aberta para Android release/AAB, teste físico, iOS, anexos nativos, push e operação offline.

### 2026-07-07 — Instalador Windows Tauri 0.1.0 gerado

- Toolchain x64 MSVC, cargo-xwin, LLVM e NSIS configurados de forma reproduzível.
- Instalador salvo em `artifacts/windows/Chamados-TI-0.1.0-x64-setup.exe`.
- Binário COFF x86-64 e instalador NSIS foram validados; ASLR, high-entropy VA e DEP/NX estão habilitados.
- Sessão usa o Windows Credential Manager pelo mesmo `keyring` do Tauri; access token permanece em memória.
- O build cruzado foi concluído no macOS, método marcado como experimental pelo Tauri.
- A etapa desktop continua aberta para instalação em Windows real, assinatura Authenticode, atualização assinada, build Intel do macOS e notarização Apple.
