# Chamados TI — Linha de Base Operacional

Esta skill concentra a operação segura do Chamados-TI: criação, consulta, edição e exclusão de chamados; autenticação; anexos; dashboard; PWA; API; PostgreSQL; validação; backup e preparação para publicação.

Use-a sempre que a solicitação mencionar erros em chamados, dados antigos na tela, cache, PWA, staging, backup ou atualização do aplicativo. Ela complementa as skills `chamados-ti-project` e `chamados-ti-creation-history`, sem duplicar credenciais ou arquivos de ambiente.

Valide a estrutura com:

```sh
sh .agents/skills/chamados-ti-operational-baseline/scripts/validate-skill.sh
```

O backup seguro continua centralizado no script da skill histórica, para evitar duas rotinas divergentes.
