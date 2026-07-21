---
name: Chamados TI
description: Central corporativa clara e acessível para abrir, acompanhar e resolver chamados internos.
colors:
  primary: "#0f766e"
  primary-deep: "#115e59"
  accent: "#b45309"
  canvas: "#f8fafc"
  surface: "#ffffff"
  ink: "#0f172a"
  muted: "#475569"
  border: "#cbd5e1"
  focus: "#14b8a6"
  danger: "#b91c1c"
  success: "#15803d"
  dark-canvas: "#061426"
  dark-sidebar: "#04101E"
  dark-surface: "#0E2238"
  dark-surface-elevated: "#132B45"
  dark-primary: "#00CDB5"
  dark-data: "#3B82F6"
  dark-warning: "#FFC62E"
  dark-success: "#31C979"
  dark-ink: "#F8FAFC"
  dark-muted: "#B8C6D9"
  dark-border: "#2B4968"
typography:
  display:
    fontFamily: "Aptos, Segoe UI, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Aptos, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Aptos, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Aptos, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  summary-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# Design System: Chamados TI

## Overview

**Creative North Star: "Central de Operações Serena"**

Chamados TI é uma ferramenta de trabalho direta, estável e profissional. A informação sempre conduz a hierarquia: cada tela deve permitir que a pessoa encontre o chamado, compreenda seu estado e execute a próxima ação sem distrações. A densidade é bem-vinda em filas e listas quando melhora a comparação; formulários, confirmações e decisões críticas recebem espaço, contexto e linguagem clara.

**The Task-First Rule.** A tarefa vem antes da decoração. Toda escolha visual deve reduzir esforço, não disputar atenção com o trabalho.

**The Persistent Preference Rule.** O tema claro é o padrão. O tema escuro é opcional, respeita a preferência do sistema na primeira visita e permanece salvo apenas no dispositivo; a alternância está disponível antes e depois do login.

**Ocean Pulse.** No modo escuro, o painel usa a composição aprovada Ocean Pulse: azul-marinho profundo no canvas, sidebar quase-preta, superfícies azuladas elevadas e turquesa como sinal de ação. Azul elétrico representa dados, âmbar indica atendimento em andamento e verde-esmeralda confirma resolução. A identidade permanece operacional, sem brilho excessivo ou gradientes decorativos.

**Key Characteristics:**

- Superfícies claras, frias e legíveis como base operacional.
- Azul-petróleo para ação, seleção, foco e confiança.
- Hierarquia explícita para prioridade, status, mensagens e próximos passos.
- Movimento restrito a resposta de estado e totalmente dispensável para quem reduz animações.
- Interação inclusiva: teclado completo, foco nítido, contraste suficiente e alvos de pelo menos 44 px.

## Colors

O azul-petróleo é o sinal de comando do produto: conduz ações primárias, seleção e foco. Os neutros azulados deixam a leitura prolongada confortável e dão estrutura a tabelas, filtros e formulários. Âmbar comunica atenção; verde, êxito; vermelho, erro ou ação irreversível.

**The Signal-Not-Decoration Rule.** Cor existe para explicar ação, prioridade ou estado. Nunca é enfeite e nunca é o único meio de comunicar uma condição.

- **Ação e seleção:** `primary` e `primary-deep` orientam botões principais, links de ação e navegação ativa.
- **Atenção:** `accent` é reservado a aviso, pendência e informação que exige leitura.
- **Estrutura:** `canvas`, `surface`, `ink`, `muted` e `border` organizam fundo, conteúdo, texto e separação sem criar ruído.
- **Estados:** `danger` só aparece em falha, exclusão ou risco; `success` confirma conclusão sem competir com a ação principal.
- **Acessibilidade:** `focus` forma um contorno visível de 3 px; em tema escuro, o conjunto Ocean Pulse (`dark-canvas`, `dark-surface`, `dark-ink`, `dark-muted` e `dark-border`) preserva a mesma leitura operacional.

**The Contrast Rule.** Texto normal deve manter contraste mínimo de 4.5:1. Status sempre combinam cor, texto e, quando houver, ícone.

## Typography

Uma única família humanista — Aptos, com Segoe UI e a fonte do sistema como alternativas — torna a interface familiar em desktops corporativos, notebooks e celulares. Títulos são firmes, rótulos guiam a ação e o texto de apoio nunca perde legibilidade.

**The Scan-First Rule.** Títulos, rótulos e valores devem permitir localizar prioridade, estado e próxima ação em poucos segundos; não use variações tipográficas apenas para ornamentação.

- **Display:** títulos de tela usam o papel `display`, com peso 700 e entrelinha compacta.
- **Título de seção:** agrupamentos e cartões usam o papel `title`, também em peso 700, sem exagerar a escala.
- **Corpo:** instruções, descrições e mensagens usam `body` com entrelinha generosa para leitura sob pressão.
- **Rótulo:** campos, filtros e metadados usam `label` com peso 600; não reduza rótulos abaixo do tamanho definido.

## Elevation

Superfícies são separadas principalmente por cor e borda. Cartões de conteúdo permanecem planos, com contorno sutil; elevação é uma exceção funcional para camadas temporárias, como avisos e diálogos de confirmação.

**The Flat-by-Default Rule.** Use a sombra curta `0 1px 2px rgb(15 23 42 / 5%)` apenas para reforço discreto. Menus, notificações e diálogos podem usar `0 4px 6px -1px rgb(15 23 42 / 10%), 0 2px 4px -2px rgb(15 23 42 / 10%)` quando precisarem se separar da página.

**The One-Decision Layer Rule.** Uma confirmação crítica recebe uma camada de diálogo clara e uma ação destrutiva destacada; a rotina nunca fica escondida sob pilhas de cartões ou modais.

## Components

Os componentes são familiares, compactos e previsíveis. A mesma ação mantém nome, posição e comportamento em todas as telas. Estado de carregamento, erro e vazio precisa explicar o que ocorreu e como continuar.

**The 44-Pixel Rule.** Botões, controles de navegação e campos interativos mantêm área de toque mínima de 44 px em qualquer dispositivo.

- **Botão principal:** preenchimento azul-petróleo, texto claro e escurecimento sutil ao passar o cursor. É exclusivo para a próxima ação mais importante da área.
- **Botão secundário:** fundo de superfície, borda visível e texto de tinta; apoia ações úteis sem competir com o fluxo principal.
- **Botão destrutivo:** vermelho somente em confirmação, remoção ou risco. Não aparece junto de ações rotineiras sem separação visual clara.
- **Campo de formulário:** superfície limpa, borda neutra, rótulo acima e foco teal de 3 px. Erros devem ficar próximos do campo e dizer como corrigir.
- **Cartão de resumo:** superfície branca, borda discreta, cantos suavemente curvos e sombra mínima. Deve resumir uma métrica ou estado, não virar painel SaaS genérico.
- **Navegação lateral:** base escura de alta estabilidade; item ativo usa teal e texto claro. A navegação móvel preserva rótulos e não esconde informação essencial.
- **Aviso e diálogo:** aviso temporário usa contraste alto para leitura imediata; diálogo separa confirmação, consequência e ação de cancelamento.

**The Visible-State Rule.** Carregando, vazio, sucesso, falha, prioridade e status devem ser entendidos por texto e contexto, nunca somente por cor ou animação.

## Do's and Don'ts

### Do's

- Use a superfície clara e os neutros frios para deixar a fila de chamados legível por longos períodos.
- Reserve o azul-petróleo para a ação principal, seleção, foco e caminhos de confiança.
- Mantenha erro, vazio e pendência explícitos, com instrução de continuidade.
- Ofereça alternância claro/escuro no login e na área autenticada, persistindo somente no dispositivo.
- Garanta navegação por teclado, foco visível, contraste de texto mínimo de 4.5:1 e alvos de 44 px.
- Respeite `prefers-reduced-motion`: transições devem ser curtas e poder desaparecer sem perda de contexto.

### Don'ts

- Não use tema escuro dominante com laranja neon.
- Não use gradientes decorativos, glassmorphism ou sombras dramáticas.
- Não transforme a interface em painéis SaaS genéricos compostos apenas por cartões.
- Não use animações de entrada ou splash que atrasem o trabalho.
- Não misture operações destrutivas às ações rotineiras.
- Não envie a preferência de tema ao servidor; ela pertence ao dispositivo.
- Não dependa apenas de cor para comunicar erro, prioridade, sucesso ou status.

**The Audit Test.** Se uma tela parecer uma vitrine em vez de uma estação de trabalho, remova ornamentos até que a próxima ação e o estado do chamado sejam inequívocos.
