# Arquivos de produção

Estes arquivos são modelos revisáveis; não executam implantação sozinhos e não contêm segredos.

## Dependências externas antes da publicação

1. Criar no provedor DNS o registro `A` `chamados.arbtechinfo.com` apontando para a VPS autorizada.
2. Liberar acesso SSH por chave para um administrador autorizado; acesso por senha não será usado.
3. Definir o destino externo cifrado para backups e as credenciais exclusivas de e-mail, se notificações forem necessárias.

## Aplicação na VPS

- `env/chamados-ti-prod.env.example` → `/etc/chamados-ti-prod.env`, preenchido somente no servidor.
- `systemd/chamados-ti-prod.service` → `/etc/systemd/system/chamados-ti-prod.service`.
- `systemd/chamados-ti-backup.service` e `systemd/chamados-ti-backup.timer` → `/etc/systemd/system/`; habilitar o timer após validar o primeiro backup.
- `nginx/chamados-ti-rate-limit.conf` → `/etc/nginx/conf.d/chamados-ti-rate-limit.conf`.
- `nginx/chamados-ti.conf` → `/etc/nginx/sites-available/chamados-ti`; depois, criar o link em `sites-enabled`.

O processo da API escuta somente em `127.0.0.1:3103`. Nginx atende o frontend, `avatars` e encaminha somente `/api/v1` para a API. PostgreSQL permanece inacessível pela internet.

## Banco e dados persistentes

Criar o usuário Linux `chamados-ti` e os diretórios abaixo antes de iniciar o serviço:

```text
/var/lib/chamados-ti/public/avatars
/var/lib/chamados-ti/uploads/ticket_attachments
/var/backups/chamados-ti-prod
```

`DATA_DIR=/var/lib/chamados-ti` mantém avatares e anexos fora da pasta de release. Antes de aplicar as migrations, executar backup e ensaio de restauração conforme `PLANO_DEPLOY_PRODUCAO_VPS.md`.

O timer de backup executa diariamente às 03:15 UTC, com atraso aleatório de até 10 minutos. A retenção deve ser definida conscientemente antes de habilitar qualquer exclusão automática.

## Segurança operacional

- Não versionar `.env`, dumps, anexos, chaves SSH ou certificados.
- Executar a API como `chamados-ti`, nunca como `root`.
- Abrir somente SSH administrativo, HTTP e HTTPS no firewall.
- Validar `nginx -t`, `systemctl status chamados-ti-prod`, `/api/v1/health` e `/api/v1/ready` antes de liberar o domínio.
