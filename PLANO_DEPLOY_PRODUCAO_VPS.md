# Plano de deploy de produção — Chamados TI

**Status:** pronto para revisão; nenhuma alteração na VPS, no DNS ou no banco será feita por este plano.

## 1. Decisão recomendada

Usar uma implantação única e isolada na VPS atual, com um subdomínio próprio:

```text
Usuários web/PWA e aplicativos instalados
                │ HTTPS
                ▼
  chamados.arbtechinfo.com (Nginx)
        ├── SPA React/Vite
        └── /api/v1 → Express em 127.0.0.1:3103
                              │ conexão local autenticada
                              ▼
                    PostgreSQL: chamados_ti_prod
                    anexos privados fora da web pública
```

- **Domínio proposto:** `chamados.arbtechinfo.com`. Não usar o domínio raiz, para não interferir nos outros serviços já existentes.
- **Banco recomendado:** PostgreSQL local na VPS, escutando apenas em `127.0.0.1` ou socket Unix. A porta `5432` não será exposta à internet.
- **Aplicação:** frontend e API sob a mesma origem HTTPS. No navegador, a API usará `/api/v1`; os instaladores receberão o endereço HTTPS completo somente depois da homologação de produção.
- **Operação:** usuário Linux exclusivo sem login, serviço `systemd`, Nginx, TLS Let's Encrypt, firewall e backup automatizado.

## 2. Pré-requisitos e decisões que precisam estar fechadas

| Item | Decisão | Responsável | Bloqueia produção |
|---|---|---|---|
| DNS | Criar o registro A de `chamados.arbtechinfo.com` para a VPS | Administrador do domínio | Sim |
| Acesso ao servidor | Chave SSH individual; acesso por senha desativado após a transição | Administrador da VPS | Sim |
| E-mail | Definir remetente validado e credenciais SMTP/Brevo exclusivas de produção | Administrador do e-mail | Sim para notificações |
| Backup externo | Definir destino cifrado fora da VPS e retenção | Responsável pela operação | Sim |
| Janela | Escolher horário com disponibilidade para monitorar por ao menos uma hora | Responsável do negócio | Sim |
| Clientes instaláveis | Manter os instaladores de teste apontando para staging até a produção passar pela homologação | Equipe de produto | Sim para distribuição |

Nenhuma senha, token, URL de conexão do banco ou chave privada será colocada neste repositório, em instaladores ou neste documento.

## 3. Fase 0 — congelamento e evidências locais

1. Criar um identificador de release imutável, registrar hash dos arquivos e gerar o pacote de implantação sem `.env`, backups, `node_modules`, builds temporários ou instaladores.
2. Rodar `npm run verify`, `npm run test:e2e`, auditoria de dependências e detector visual.
3. Gerar build de produção com `VITE_API_BASE_URL=/api/v1` para a versão web.
4. Registrar a versão dos scripts SQL `001`, `002` e `003`, com seus checksums, na ata da implantação.
5. Criar backup local do banco de staging e confirmar que `pg_restore --list` lê o catálogo antes de tocar na produção.

**Critério para avançar:** todos os testes aprovados e pacote do release identificado. A validação atual já aprovou lint, 18 testes de frontend, 42 testes de backend, 2 testes de scripts, E2E desktop/mobile e Lighthouse local da tela de login.

## 4. Fase 1 — preparação segura da VPS

1. Inventariar serviços, portas, vhosts Nginx, uso de disco, memória e versões de Node/PostgreSQL sem alterar os serviços existentes.
2. Criar o usuário de serviço `chamados-ti`, sem shell de login e sem permissões administrativas gerais.
3. Definir estrutura de releases:

   ```text
   /opt/chamados-ti/releases/<release-id>/
   /opt/chamados-ti/current -> releases/<release-id>
   /var/lib/chamados-ti/uploads/
   /var/backups/chamados-ti-prod/
   /etc/chamados-ti-prod.env
   ```

4. Restringir permissões: diretórios de anexos e backups em `0700`; ambiente em `0640`, pertencente a `root:chamados-ti`; nenhum arquivo de ambiente dentro do release.
5. Aplicar firewall com somente SSH administrativo, HTTP e HTTPS. PostgreSQL e a porta da API ficam internos.
6. Confirmar atualizações de segurança, renovação automática de certificados, rotação de logs e proteção contra tentativas repetidas de SSH.

**Critério para avançar:** serviço existente continua saudável, apenas as portas necessárias ficam públicas e a nova aplicação ainda não recebe tráfego.

## 5. Fase 2 — criação do banco de produção

1. Instalar ou confirmar PostgreSQL suportado e configurar autenticação SCRAM.
2. Criar o banco `chamados_ti_prod` e uma função exclusiva da aplicação, sem `SUPERUSER`, `CREATEDB`, `CREATEROLE` ou acesso a outros bancos.
3. Limitar a conexão do papel da aplicação ao banco de produção; a API usará conexão local privada.
4. Criar `/etc/chamados-ti-prod.env` com, no mínimo:

   - `NODE_ENV=production`
   - `HOST=127.0.0.1` e porta interna exclusiva
   - `DATABASE_URL` com credencial exclusiva de produção
   - `JWT_SECRET` aleatório, longo e exclusivo de produção
   - `CLIENT_URLS=https://chamados.arbtechinfo.com`
   - `TRUST_PROXY=true`
   - variáveis de SMTP/Brevo e remetente validado
   - diretório de backup e diretório privado de anexos

5. Aplicar as migrations, uma por vez, no banco vazio, interrompendo imediatamente se qualquer script falhar.
6. Criar o primeiro backup em formato custom, validar checksum e catálogo e guardar também uma cópia cifrada fora da VPS.
7. Executar um ensaio de restauração em banco temporário, validar `/api/v1/ready` e destruir esse banco de ensaio.

**Critério para avançar:** migration, backup e restauração são comprovados; a API consegue responder `ready` usando somente o banco de produção.

## 6. Fase 3 — atualização obrigatória do staging

O staging existente precisa receber a versão atual antes da produção. A versão antiga não conhece todos os fluxos recentes, portanto não pode ser a evidência final de liberação.

1. Fazer backup do staging atual e implantar o mesmo release candidato, com banco e segredos isolados.
2. Aplicar migrations e confirmar `health` e `ready` via HTTPS.
3. Executar um roteiro autenticado com conta de teste:

   - cadastro de usuário comum, login e logout;
   - abertura de chamado com imagem e vídeo permitidos;
   - comentário, mudança de status, consulta e métricas;
   - edição e exclusão de usuário, incluindo proteção do último administrador;
   - exclusão e limpeza de chamado, confirmando remoção de anexos;
   - bloqueio de CORS não autorizado, rate limit e sessão expirada;
   - verificação em tema claro/escuro, desktop e celular.

4. Verificar logs sem senha, token, conteúdo de chamado ou dados sensíveis.
5. Fazer uma restauração de staging a partir do backup recém-criado e registrar o tempo de recuperação.

**Critério para avançar:** nenhum erro crítico/alto, fluxos autenticados aprovados e restauração reproduzível.

## 7. Fase 4 — publicação controlada em produção

1. Criar backup pré-deploy dos serviços afetados, da configuração Nginx, do banco e do diretório de anexos.
2. Enviar o release para uma nova pasta, instalar somente dependências de produção e compilar backend/frontend antes de mudar o apontamento `current`.
3. Criar o serviço `chamados-ti-prod` no `systemd`, executando como `chamados-ti`, com reinício automático e acesso apenas ao ambiente externo em `/etc`.
4. Criar o vhost Nginx para o subdomínio, com:

   - redirecionamento HTTP para HTTPS;
   - arquivos estáticos da SPA e fallback controlado para `index.html`;
   - proxy exclusivo de `/api/v1` para `127.0.0.1:3103`;
   - limites de corpo compatíveis com anexos, timeout apropriado e rate limit de borda;
   - HSTS, bloqueio de framing, `nosniff`, CSP compatível com a SPA e logs separados;
   - nenhum mapeamento público para backups, `.env` ou anexos privados.

5. Emitir ou renovar o certificado Let's Encrypt depois que o DNS estiver resolvendo corretamente.
6. Alternar o link `current`, recarregar Nginx e reiniciar o serviço somente após os artefatos e as configurações terem passado na checagem local da VPS.

## 8. Verificação de liberação e observação

| Momento | Verificações obrigatórias |
|---|---|
| Imediatamente | HTTPS, redirecionamento, manifesto, `/api/v1/health`, `/api/v1/ready`, logs e portas expostas |
| Primeiros 5 min | login, cadastro comum, criação de chamado, anexo, comentário, alteração de status e logout |
| 15 min | métricas, administração, CORS negado, limite de abuso, e-mail e uso de CPU/memória/disco |
| 60 min | backup automático/manual, cópia externa confirmada, erros Nginx/API/DB e disponibilidade externa |
| Dia seguinte | revisão de logs, capacidade de disco por anexos e confirmação de renovação TLS/backup |

O lançamento é aceito somente se `health` e `ready` retornarem 200, as operações críticas funcionarem com uma conta comum e uma administrativa, e não houver erro novo persistente nos logs.

## 9. Rollback

- **Falha antes da migration:** interromper a implantação e manter o release anterior.
- **Falha após publicação, sem mudança de dados:** restaurar o link `current` para o release anterior e reiniciar o serviço.
- **Falha após migration:** primeiro estabilizar a aplicação com rollback compatível; restaurar o banco apenas a partir do backup validado e somente com decisão explícita, pois pode descartar dados novos.
- **Falha de banco ou anexos:** isolar a aplicação, restaurar banco e anexos de cópias com checksum confirmado e validar em ambiente de ensaio antes de reabrir o serviço.

As migrations futuras devem ser aditivas e compatíveis com o release anterior. Não haverá migration destrutiva no mesmo passo da publicação.

## 10. Monitoramento, backup e custos

- Monitorar `systemd`, Nginx, PostgreSQL, uso de disco, memória, CPU, erros 5xx e resposta de `/ready`.
- Manter logs rotacionados e sem segredos. Registrar ações administrativas sem armazenar tokens ou conteúdo sensível.
- Fazer backup diário de PostgreSQL e anexos, manter cópia pré-deploy e testar restauração ao menos mensalmente.
- Usar retenção mínima sugerida: 7 diários, 4 semanais e 3 mensais, sempre com uma cópia externa cifrada.
- A aplicação usa a VPS e o domínio já existentes. O único custo que pode ser adicional é uma cópia externa de backup e, se necessário, o serviço de e-mail; ambos podem começar em faixas gratuitas, mas backup fora da VPS não deve depender apenas de espaço gratuito sem garantia de retenção.

## 11. Itens fora deste deploy

- Os instaladores atuais macOS, Windows e Android permanecem de teste. Não serão redistribuídos como produção até possuírem assinatura/notarização/keystore de release e passarem em dispositivos reais.
- MFA para administradores, auditoria administrativa append-only e streaming de anexos grandes seguem como reforços de produção planejados; serão tratados em uma etapa de segurança posterior, sem atrasar a preparação do ambiente caso os critérios de risco sejam aceitos.

## 12. Ordem de execução proposta

1. Aprovar domínio, e-mail e destino de backup externo.
2. Inventariar e endurecer a VPS sem interromper os serviços existentes.
3. Criar banco, função da aplicação, backup e ensaio de restauração.
4. Atualizar staging com o release atual e homologar os fluxos completos.
5. Agendar a janela, executar backup pré-deploy e publicar produção.
6. Monitorar por uma hora, confirmar a cópia externa e registrar a versão liberada.
