# Staging e recuperação — Chamados TI

## Objetivo

Manter a homologação isolada, sem reutilizar segredos de produção e com retorno testável.

## Staging ativo em 2026-07-07

- URL principal: `https://chamados-staging.arbtechinfo.com.br`.
- URL temporária de contingência: documentada apenas no inventário privado.
- VPS: documentado apenas no inventário privado.
- Frontend: Nginx sobre HTTPS, release `20260707-0954`.
- API: release `20260707-1623-desktop-auth`, com transporte de sessão rotativa para o cliente Tauri.
- API: systemd `chamados-ti-staging`, apenas em `127.0.0.1:3102`.
- Banco isolado: `chamados_ti_staging`.
- Certificado Let's Encrypt válido para os dois domínios, com renovação automática; validade atual até 2026-10-05.
- Segredos: `/etc/chamados-ti-staging.env`, fora do release e com acesso restrito.
- Backup remoto pós-deploy validado em `/var/backups/chamados-ti-staging/`.

O domínio corporativo `chamados-staging.arbtechinfo.com.br` é o endereço principal. O endereço técnico temporário permanece apenas como contingência privada.

Registro DNS ativo:

```text
Tipo: A
Nome: chamados-staging
Destino: consultar inventário privado de infraestrutura
```

Em 2026-07-07, o DNS, o certificado TLS, o redirecionamento HTTP para HTTPS, o frontend, `/api/v1/health`, `/api/v1/ready`, o manifest PWA e o CORS foram validados externamente. Uma origem não autorizada recebeu HTTP 403.

## Ambientes

- Frontend: copiar `.env.staging.example` para `.env.staging`. A API usa `/api/v1` na mesma origem HTTPS.
- Backend: copiar `backend/.env.staging.example` para `backend/.env.staging` e preencher segredos exclusivos de staging.
- Banco: usar instância/banco separado de produção. Nunca apontar staging para o banco produtivo.
- CORS: listar somente origens completas em `CLIENT_URLS`, separadas por vírgula.

## Backup local

```bash
cd backend
npm run backup
npm run backup:verify -- ../backups/chamados-ti-AAAA-MM-DD.dump
```

O backup usa formato custom do PostgreSQL, permissões locais restritas e checksum SHA-256. O conteúdo de `backups/` é ignorado pelo Git.

## Restauração de staging

```bash
cd backend
ENV_FILE=.env.staging CONFIRM_RESTORE=staging npm run restore:staging -- ../backups/arquivo.dump
```

A restauração usa `--clean --if-exists` e apaga/substitui objetos no banco de destino. Confirmar duas vezes que `.env.staging` não aponta para produção. O primeiro restore real de staging foi concluído e validado em 2026-07-07.

## Verificação

1. `GET /api/v1/health` deve retornar HTTP 200 sem consultar o banco.
2. `GET /api/v1/ready` deve retornar HTTP 200 somente com PostgreSQL acessível.
3. Validar login, abertura, resposta, anexo e consulta com dados sanitizados.
4. Confirmar que uma origem fora de `CLIENT_URLS` recebe bloqueio CORS.
5. Ensaiar restauração em banco descartável antes de promover qualquer release.

## Rollback

Parar a nova versão, restaurar o artefato anterior da API e, apenas se houve migration incompatível, restaurar o backup validado. Investigar somente depois de estabilizar o serviço.
