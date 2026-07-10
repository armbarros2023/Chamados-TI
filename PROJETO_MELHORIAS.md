# Projeto de Modernização — Chamados TI

## 1. Objetivo

Modernizar o sistema de chamados existente, preservando suas funções atuais e preparando uma nova experiência web, PWA, Android e iOS. A solução deverá ser clara, corporativa, acessível, segura e capaz de consultar dados carregados e registrar novos chamados mesmo sem conexão.

Este documento define o projeto aprovado para análise. Nenhuma implementação funcional faz parte desta etapa.

## 2. Diagnóstico do sistema atual

### Estrutura existente

- Frontend SPA com React 19, TypeScript, Vite e React Router.
- API REST com Node.js, Express e TypeScript.
- Persistência em PostgreSQL.
- Autenticação JWT e controle básico de perfis.
- Cadastro, consulta, atualização e exclusão de chamados.
- Comentários, anexos, avatares, e-mail e gestão de usuários.

### Principais pontos de melhoria

- Interface ainda centrada no desktop e com navegação móvel limitada.
- Estilo visual escuro, com gradientes, transparências e padrões inconsistentes.
- Componentes extensos e responsabilidades concentradas no dashboard.
- Uso frequente de `alert` e `confirm`, sem feedback contextual consistente.
- Alvos de toque pequenos e lacunas de acessibilidade.
- Ausência de testes automatizados, lint e validação contínua.
- Tipos, validações e regras não estão organizados para compartilhamento entre plataformas.
- API sem versionamento formal e sem contrato central compartilhado.
- Estratégia offline e aplicativos móveis ainda inexistentes.
- Fluxos administrativos e operações destrutivas aparecem próximos às rotinas diárias.

## 3. Escopo aprovado

### Incluído

- Nova identidade visual clara e corporativa.
- Modernização da aplicação web existente.
- PWA responsiva e instalável.
- Aplicativos Android e iOS com React Native e Expo.
- Navegação adaptada a desktop, celular e tablet.
- Consulta offline de chamados já carregados.
- Criação offline de chamados, com fila para envio posterior.
- Notificações push para eventos relevantes.
- Design system, contratos e regras compartilhados.
- Reestruturação da API e reforço de segurança.
- Testes automatizados, acessibilidade, desempenho e observabilidade.

### Não incluído inicialmente

- Publicação imediata na App Store e Google Play.
- Edição offline de chamados, comentários ou status.
- Substituição do PostgreSQL.
- Mudança completa das regras de negócio sem validação da empresa.
- Recursos de IA, chatbot ou automações não solicitadas.

## 4. Premissas

- Produto destinado inicialmente ao uso interno por funcionários e equipe de TI.
- Suporte a telefones e tablets Android e iOS.
- Capacidade inicial para centenas de usuários e milhares de chamados.
- Meta de resposta visual inferior a 400 ms para interações locais.
- Meta de carregamento inicial de até 3 segundos em conexão comum.
- Disponibilidade esperada da API de 99,5%.
- Interface compatível com WCAG 2.2 nível AA.
- Manutenção por equipe familiarizada com TypeScript e React.
- Política de retenção será confirmada antes da migração de produção.

## 5. Arquitetura recomendada

Adotar monorepo modular, com implantação progressiva:

```text
Chamados-TI/
├── apps/
│   ├── web/             # React + Vite + PWA
│   ├── mobile/          # React Native + Expo
│   └── api/             # Express + PostgreSQL
├── packages/
│   ├── contracts/       # Tipos, schemas e contratos da API
│   ├── core/            # Regras de negócio compartilhadas
│   ├── api-client/      # Cliente HTTP, autenticação e erros
│   ├── design-tokens/   # Cores, tipografia, espaços e estados
│   └── test-utils/      # Utilitários e dados de teste
└── docs/                # Arquitetura, decisões e operação
```

O pacote de tokens visuais será compartilhado, mas os componentes de interface deverão respeitar cada plataforma. Web e mobile compartilharão regras e contratos, sem forçar componentes DOM dentro do React Native.

## 6. Experiência e navegação

### Áreas principais

1. **Início:** indicadores úteis, chamados críticos, pendências e atividade recente.
2. **Chamados:** pesquisa, filtros, ordenação e visões “Meus”, “Equipe” e “Todos”.
3. **Novo chamado:** fluxo progressivo, anexos, rascunho e revisão.
4. **Conta:** perfil, preferências, notificações e sessão.
5. **Administração:** usuários, categorias, prioridades, métricas e retenção.

### Comportamento por dispositivo

- Desktop: barra lateral compacta, tabela com cabeçalho fixo e painel lateral de detalhes.
- Web móvel/PWA: barra inferior, cartões compactos e detalhes em página completa.
- Android/iOS: abas inferiores, pilhas internas, gestos e retorno nativos.
- Tablet: navegação lateral reduzida e conteúdo em duas colunas quando houver espaço.

### Fluxo de novo chamado

1. Categoria e assunto.
2. Descrição estruturada do problema.
3. Prioridade e anexos.
4. Revisão e envio.

O formulário terá salvamento automático de rascunho, validação durante o preenchimento e confirmação clara do resultado.

## 7. Direção visual

- Modo claro como padrão e modo escuro opcional.
- Fundo branco e cinza suave, texto grafite e azul-petróleo como base proposta.
- Acento quente discreto para destaque, sem competir com os estados.
- Azul para aberto, âmbar para andamento, verde para resolvido e vermelho para erro ou perigo.
- Tipografia legível, espaçamento em escala de 8 pontos e hierarquia por contraste.
- Sombras discretas e ausência de efeitos decorativos sem função.
- Alvos de toque mínimos de 44 pt no iOS e 48 dp no Android.
- Escalonamento de texto, navegação por teclado, foco visível e movimento reduzido.

Antes da implementação visual definitiva, deverão ser produzidos protótipos das telas principais para aprovação.

## 8. Estratégia offline

### Dados locais

- SQLite para chamados consultados, rascunhos e fila de operações.
- SecureStore/Keychain para tokens e segredos de sessão.
- Registro da última sincronização e origem de cada informação.

### Criação offline

1. O usuário cria o chamado normalmente.
2. O aplicativo salva o conteúdo e os anexos localmente.
3. Um identificador único de idempotência é criado.
4. O item aparece como “Pendente de envio”.
5. Ao recuperar conexão, anexos e chamado são enviados com repetição segura.
6. O servidor impede duplicação e devolve o número definitivo.
7. Falhas permanecem na fila com motivo e opção de tentar novamente.

### Limites da primeira versão

- Consulta offline é somente leitura.
- Comentários e mudanças de status exigem conexão.
- Dados locais nunca serão apresentados como atualizados sem informar a última sincronização.

## 9. API, dados e segurança

- Versionar endpoints em `/api/v1`.
- Adotar schemas de entrada e saída compartilhados.
- Padronizar códigos e corpos de erro.
- Usar paginação por cursor e filtros no servidor.
- Implementar access token curto e renovação segura de sessão.
- Validar autorização em todos os endpoints por perfil e propriedade do recurso.
- Aplicar limites de requisição e proteção específica no login.
- Validar tipo, tamanho e nome dos anexos; armazená-los fora da árvore pública quando necessário.
- Criar trilha de auditoria para alterações administrativas e mudanças de status.
- Remover dados sensíveis de logs.
- Manter migrations versionadas, backup e rollback.
- Revisar inconsistências atuais entre banco, arquivos e e-mail antes da migração.

## 10. Estados e tratamento de erros

Cada tela deverá prever:

- Carregamento inicial com skeleton.
- Atualização em segundo plano.
- Estado vazio com ação útil.
- Falha de rede com tentativa novamente.
- Sessão expirada com recuperação previsível.
- Operação offline pendente.
- Falha de sincronização e conflito.
- Confirmação acessível para ações destrutivas.
- Feedback otimista somente quando houver rollback confiável.

## 11. Plano de implementação

### Fase 0 — Proteção da base atual

- Criar inventário de rotas, banco, permissões e integrações.
- Registrar contratos e comportamentos atuais.
- Adicionar lint, formatação, testes mínimos e pipeline de build.
- Criar backup e estratégia de rollback.

### Fase 1 — Fundação compartilhada

- Converter o repositório para monorepo.
- Criar contratos, schemas, cliente de API e regras centrais.
- Versionar a API sem interromper o frontend atual.
- Padronizar erros, paginação, autenticação e autorização.

### Fase 2 — Design system e protótipo

- Definir identidade, tokens, tipografia, iconografia e componentes básicos.
- Prototipar login, início, lista, detalhe, novo chamado e administração.
- Validar desktop, celular, tablet, modo escuro e acessibilidade.

### Fase 3 — Nova aplicação web/PWA

- Implementar layout responsivo e nova navegação.
- Refatorar dashboard, chamados, formulários, perfil e usuários.
- Adicionar cache controlado, manifest, service worker e instalação PWA.
- Validar compatibilidade com a API e manter rollout reversível.

### Fase 4 — Aplicativo Expo

- Criar navegação Android/iOS e componentes nativos.
- Implementar autenticação segura, lista, detalhes, criação e anexos.
- Adicionar SQLite, fila offline, sincronização e notificações push.
- Testar celulares, tablets, gestos, acessibilidade e desempenho.

### Fase 5 — Homologação e lançamento controlado

- Executar testes completos de regressão e segurança.
- Homologar com grupo reduzido de usuários.
- Monitorar erros, latência, sincronização e adoção.
- Corrigir problemas antes de substituir a versão atual.
- Preparar publicação nas lojas como projeto separado.

## 12. Estratégia de testes

- Unitários: regras de prioridade, status, permissões, validações e fila offline.
- Integração: autenticação, usuários, chamados, comentários, anexos e banco.
- Componentes: formulários, filtros, estados vazios, erros e acessibilidade.
- E2E web: login, abertura, consulta, comentário, mudança de status e administração.
- E2E mobile: fluxo principal, anexos, offline, reconexão e notificações.
- Resiliência: perda de conexão, repetição, duplicidade e interrupção durante upload.
- Segurança: autorização horizontal/vertical, upload, rate limit e sessão.
- Desempenho: listas grandes, dispositivos modestos e conexão lenta.

## 13. Critérios de aceite

- Todas as funções existentes relevantes continuam disponíveis.
- Interface funciona em desktop, celular e tablet sem perda de conteúdo.
- Web pode ser instalada como PWA.
- Android e iOS usam navegação e interações adequadas às plataformas.
- Chamados carregados podem ser consultados offline.
- Novos chamados offline são enviados uma única vez após reconexão.
- Usuário identifica claramente estados pendentes, sincronizados e com erro.
- Acessibilidade atinge WCAG 2.2 AA nos fluxos principais.
- Nenhum token fica em armazenamento inseguro no aplicativo.
- Testes críticos passam antes de cada implantação.
- Rollback da versão web e das migrations é documentado e testado.

## 14. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Reestruturação interromper o sistema atual | Migração progressiva e compatibilidade temporária |
| Duplicação durante sincronização | Chaves de idempotência e fila transacional |
| Divergência entre web e mobile | Contratos, regras e tokens compartilhados |
| Dados locais desatualizados | Última sincronização visível e cache com validade |
| Anexos consumirem espaço ou dados | Limites, compressão e política de limpeza |
| Escopo crescer durante a modernização | Fases, critérios de aceite e backlog separado |
| Permissões atuais insuficientes | Matriz de autorização e testes por perfil |

## 15. Métricas de sucesso

- Tempo necessário para abrir um chamado.
- Taxa de conclusão do formulário.
- Tempo até primeira resposta e resolução.
- Taxa de erros e tentativas de sincronização.
- Percentual de chamados offline enviados com sucesso.
- Desempenho de carregamento e resposta visual.
- Incidentes de autorização e falhas em produção.
- Satisfação dos usuários após homologação.

## 16. Registro de decisões

| Decisão | Alternativas consideradas | Motivo |
|---|---|---|
| Web/PWA e aplicativos nativos | Apenas PWA ou apenas nativo | Atender uso amplo e aproveitar recursos móveis |
| React Native + Expo | Flutter ou código nativo separado | Compatibilidade com TypeScript e velocidade de evolução |
| Monorepo modular | Projetos isolados ou PWA primeiro | Compartilhar contratos e reduzir divergência |
| Identidade clara e corporativa | Manter tema escuro atual | Melhorar legibilidade, confiança e produtividade |
| SQLite e fila offline | Conexão obrigatória | Permitir consulta e abertura de chamados sem rede |
| Edição offline limitada na V1 | Sincronização completa desde o início | Reduzir conflitos e risco de implantação |
| Implantação progressiva | Reescrita e troca imediata | Preservar operação e possibilitar rollback |

## 17. Próxima etapa proposta

Após aprovação deste projeto, iniciar somente a Fase 0: proteger a base atual, documentar contratos, criar testes mínimos e preparar um protótipo visual navegável. Nenhuma migração estrutural ou substituição de produção deverá ocorrer antes da aprovação desse protótipo.

O roteiro operacional aprovado para transformar a aplicação em PWA e instaladores está em [`implantacao-multiplataforma.md`](implantacao-multiplataforma.md). Para maximizar o reaproveitamento do frontend React existente, esse roteiro adota Tauri no desktop e Capacitor no mobile, substituindo React Native/Expo como primeira opção de empacotamento. React Native permanece como alternativa caso a validação em aparelhos revele limitações materiais.
