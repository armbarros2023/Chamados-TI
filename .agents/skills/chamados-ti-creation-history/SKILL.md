---
name: chamados-ti-creation-history
description: Histórico técnico e decisório do Chamados-TI/Suporte Chemisch. Use quando o usuário pedir o que já foi criado, decisões anteriores, arquivos alterados, resultados de testes, PWA, tema claro/escuro, API/staging, instaladores macOS/Android/Windows, backups, plano Tauri/Capacitor, custos, próximos passos ou continuidade da implantação multiplataforma.
---

# Histórico de criação do Chamados TI

## Recuperar o contexto

1. Trabalhar em `/Users/arbtechinfo/Projetos CC/Chamados-TI`.
2. Ler [references/creation-history.md](references/creation-history.md) para obter a cronologia e o estado validado.
3. Ler `PROJETO_MELHORIAS.md` para o escopo do produto e `implantacao-multiplataforma.md` para a sequência operacional.
4. Conferir os arquivos atuais antes de afirmar que um recurso continua funcionando; histórico não substitui verificação fresca.

## Continuar a implantação

- Preservar a aplicação atual e executar uma etapa por vez.
- Manter a arquitetura `aplicativo → API HTTPS → PostgreSQL`; nunca conectar instaladores diretamente ao banco.
- Tratar Tauri como primeira opção de desktop e Capacitor como primeira opção mobile. React Native/Expo permanece alternativa condicionada a limitações comprovadas.
- Aplicar TDD em comportamento novo e executar `npm run verify` após mudanças relevantes.
- Executar Playwright em desktop/mobile e Lighthouse em build servida para alterações web.
- Atualizar o histórico somente com evidência: comandos, resultados, arquivos e limitações reais.

## Proteger informações sensíveis

- Nunca ler, copiar ou registrar conteúdo de `backend/.env` no histórico.
- Não persistir senhas, tokens, JWT secrets, credenciais SMTP ou URLs privadas.
- Registrar apenas que existe administrador local de demonstração; revalidar ou redefinir acesso quando necessário.

## Registrar novos marcos

Ao concluir uma etapa autorizada:

1. Atualizar `implantacao-multiplataforma.md` com checkbox, data e evidência.
2. Acrescentar a cronologia em `references/creation-history.md` sem apagar marcos anteriores.
3. Separar claramente concluído, validado, pendente e não iniciado.
4. Validar esta skill com `quick_validate.py` após mudanças estruturais.

## Criar backup completo seguro

1. Executar `sh .agents/skills/chamados-ti-creation-history/scripts/create-project-backup.sh` somente depois dos gates aplicáveis.
2. Confirmar o arquivo `.tar.gz`, o checksum `.sha256` e o inventário `.contents.txt` em `backups/project/`.
3. Não incluir `.env`, dependências, caches ou saídas intermediárias reproduzíveis. Preservar código, documentação, skills e instaladores finais.
4. Registrar o caminho, tamanho e checksum no histórico sem copiar segredos.
